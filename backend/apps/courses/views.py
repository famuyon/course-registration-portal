from django.shortcuts import render
from rest_framework import generics, permissions, filters, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import Http404
from .models import Department, Course, AcademicSession, CourseAllocation
from registration.models import Registration, RegistrationCourse, RegistrationApproval
from .serializers import (
    DepartmentSerializer,
    CourseSerializer,
    AcademicSessionSerializer,
    CourseAllocationSerializer
)
from registration.serializers import RegistrationSerializer, RegistrationCourseSerializer
from django.db.models import Q

# Create your views here.

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions required for this view.
        """
        permission_classes = [permissions.IsAuthenticated]
        
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only registration officers, HODs, and staff can modify departments
            def check_admin_permission(request, view, obj=None):
                user = request.user
                return (user.user_type in ['registration_officer', 'hod'] or user.is_staff)
            
            class AdminOnlyPermission(permissions.BasePermission):
                def has_permission(self, request, view):
                    return check_admin_permission(request, view)
                
                def has_object_permission(self, request, view, obj):
                    return check_admin_permission(request, view, obj)
            
            permission_classes = [permissions.IsAuthenticated, AdminOnlyPermission]
        
        return [permission() for permission in permission_classes]

class DepartmentListView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

class CourseListView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'level', 'semester', 'is_active']
    search_fields = ['code', 'title']

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = (permissions.IsAuthenticated,)

class AcademicSessionListView(generics.ListCreateAPIView):
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_current']

class AcademicSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer
    permission_classes = (permissions.IsAuthenticated,)

class CourseAllocationListView(generics.ListCreateAPIView):
    queryset = CourseAllocation.objects.all()
    serializer_class = CourseAllocationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department', 'session', 'course']

class CourseAllocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseAllocation.objects.all()
    serializer_class = CourseAllocationSerializer
    permission_classes = (permissions.IsAuthenticated,)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'level', 'semester', 'is_active']
    search_fields = ['code', 'title']

    def get_queryset(self):
        return Course.objects.all()

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions required for this view.
        """
        permission_classes = [permissions.IsAuthenticated]
        
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only registration officers, HODs, and staff can modify courses
            def check_admin_permission(request, view, obj=None):
                user = request.user
                return (user.user_type in ['registration_officer', 'hod'] or user.is_staff)
            
            class AdminOnlyPermission(permissions.BasePermission):
                def has_permission(self, request, view):
                    return check_admin_permission(request, view)
                
                def has_object_permission(self, request, view, obj):
                    return check_admin_permission(request, view, obj)
            
            permission_classes = [permissions.IsAuthenticated, AdminOnlyPermission]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'])
    def register_courses(self, request):
        """Register multiple courses - creates pending registration"""
        user = request.user
        course_ids = request.data.get('course_ids', [])
        comments = request.data.get('comments', '')
        
        if not course_ids:
            return Response(
                {'detail': 'No courses selected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get current academic session
        current_session = AcademicSession.objects.filter(is_current=True).first()
        if not current_session:
            return Response(
                {'detail': 'No active academic session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get courses
        courses = Course.objects.filter(id__in=course_ids)
        if len(courses) != len(course_ids):
            return Response(
                {'detail': 'Some courses not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate total units
        total_units = sum(course.units for course in courses)
        if total_units > 24:
            return Response(
                {'detail': f'Maximum units (24) exceeded. Selected courses total {total_units} units.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clean up any empty registrations (with 0 total units) first
        Registration.objects.filter(
            student=user,
            session=current_session,
            semester='2',
            total_units=0
        ).delete()
        
        # Check if user already has a pending/approved registration for this session
        # Only consider registrations with courses (total_units > 0)
        existing_registration = Registration.objects.filter(
            student=user,
            session=current_session,
            semester='2',  # Current semester (Second Semester)
            total_units__gt=0  # Only consider registrations with courses
        ).first()
        
        if existing_registration:
            if existing_registration.status == 'approved':
                return Response(
                    {'detail': 'You already have an approved registration for this session'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif existing_registration.status == 'pending':
                return Response(
                    {'detail': 'You already have a pending registration. Please wait for approval.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create registration with atomic transaction
        with transaction.atomic():
            # Create registration
            registration = Registration.objects.create(
                student=user,
                session=current_session,
                department=user.department,
                level=user.level or 500,  # Default to 500 for graduate level
                semester='2',  # Current semester (Second Semester)
                status='pending',
                total_units=total_units,
                comments=comments
            )
            
            # Add courses to registration
            for course in courses:
                RegistrationCourse.objects.create(
                    registration=registration,
                    course=course
                )
        
        return Response({
            'detail': 'Course registration submitted successfully. Status: Pending approval.',
            'registration_id': registration.id,
            'status': 'pending',
            'total_units': total_units,
            'courses': [{'id': course.id, 'code': course.code, 'title': course.title} for course in courses]
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        # Check if already registered
        if CourseAllocation.objects.filter(course=course, registered_students=user).exists():
            return Response(
                {'detail': 'Already registered for this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check total units
        registered_courses = CourseAllocation.objects.filter(registered_students=user)
        total_units = sum(allocation.course.units for allocation in registered_courses)
        
        if total_units + course.units > 24:
            return Response(
                {'detail': 'Maximum units (24) exceeded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Register the course
        allocation, created = CourseAllocation.objects.get_or_create(course=course)
        allocation.registered_students.add(user)
        
        return Response(
            {'detail': 'Course registered successfully'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def unregister(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        try:
            allocation = CourseAllocation.objects.filter(course=course, registered_students=user).first()
            if allocation:
                allocation.registered_students.remove(user)
                return Response(
                    {'detail': 'Course unregistered successfully'},
                    status=status.HTTP_200_OK
                )
            return Response(
                {'detail': 'Not registered for this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except CourseAllocation.DoesNotExist:
            return Response(
                {'detail': 'Course allocation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def deregister_approved_course(self, request, pk=None):
        """Deregister from an approved course in the new registration system"""
        course = self.get_object()
        user = request.user
        
        # Find approved registration containing this course
        registration_course = RegistrationCourse.objects.filter(
            registration__student=user,
            registration__status='approved',
            course=course
        ).first()
        
        if not registration_course:
            return Response(
                {'detail': 'You are not registered for this course or registration is not approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        registration = registration_course.registration
        
        with transaction.atomic():
            # Remove the course from registration
            registration_course.delete()
            
            # Recalculate total units
            remaining_courses = RegistrationCourse.objects.filter(registration=registration)
            new_total_units = sum(rc.course.units for rc in remaining_courses)
            
            # If no courses left, delete the entire registration record
            if new_total_units == 0:
                registration.delete()
                return Response({
                    'detail': 'Course deregistered successfully. All courses removed - registration deleted.',
                    'course_code': course.code,
                    'course_title': course.title,
                    'remaining_units': 0,
                    'registration_status': 'deleted'
                }, status=status.HTTP_200_OK)
            else:
                # Update total units if courses still remain
                registration.total_units = new_total_units
                registration.save()
            
        return Response({
            'detail': 'Course deregistered successfully',
            'course_code': course.code,
            'course_title': course.title,
            'remaining_units': new_total_units,
            'registration_status': registration.status
        }, status=status.HTTP_200_OK)

# New Registration Management Views
class PendingRegistrationsView(generics.ListAPIView):
    """View for admins to see pending registrations"""
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Only allow registration officers and admin to see pending registrations
        if user.user_type in ['registration_officer', 'hod'] or user.is_staff:
            return Registration.objects.filter(status='pending').order_by('-submitted_at')
        return Registration.objects.none()

class AllRegistrationsView(generics.ListAPIView):
    """View for admins to see all registrations (pending, approved, rejected)"""
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Only allow registration officers and admin to see all registrations
        if user.user_type in ['registration_officer', 'hod'] or user.is_staff:
            # Return all registrations ordered by status (pending first) then by date
            return Registration.objects.all().order_by(
                models.Case(
                    models.When(status='pending', then=1),
                    models.When(status='approved', then=2),
                    models.When(status='rejected', then=3),
                    default=4,
                    output_field=models.IntegerField()
                ),
                '-submitted_at'
            )
        return Registration.objects.none()

class ApproveRegistrationView(generics.UpdateAPIView):
    """View for admins to approve registrations"""
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        user = request.user
        # Only allow registration officers and admin to approve
        if not (user.user_type in ['registration_officer', 'hod'] or user.is_staff):
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        registration = get_object_or_404(Registration, pk=pk)
        action = request.data.get('action')  # 'approve' or 'reject'
        comments = request.data.get('comments', '')
        
        if action == 'approve':
            registration.status = 'approved'
            # Create approval record
            RegistrationApproval.objects.create(
                registration=registration,
                approved_by=user,
                comments=comments
            )
        elif action == 'reject':
            registration.status = 'rejected'
        else:
            return Response(
                {'detail': 'Invalid action. Use "approve" or "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        registration.save()
        
        return Response({
            'detail': f'Registration {action}d successfully',
            'registration_id': registration.id,
            'status': registration.status
        })

class EditRegistrationCoursesView(generics.UpdateAPIView):
    """View for admins to edit courses in a registration"""
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        user = request.user
        # Only allow registration officers and admin to edit courses
        if not (user.user_type in ['registration_officer', 'hod'] or user.is_staff):
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        registration = get_object_or_404(Registration, pk=pk)
        
        # Allow editing of all registrations (pending, approved, rejected)
        # This enables registration officers to make changes even after approval
        
        course_ids = request.data.get('course_ids', [])
        action = request.data.get('action', 'replace')  # 'add', 'remove', or 'replace'
        
        if not course_ids and action != 'remove':
            return Response(
                {'detail': 'No courses provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get courses
        courses = Course.objects.filter(id__in=course_ids)
        if len(courses) != len(course_ids):
            return Response(
                {'detail': 'Some courses not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            if action == 'replace':
                # Remove all existing courses and add new ones
                RegistrationCourse.objects.filter(registration=registration).delete()
                
                for course in courses:
                    RegistrationCourse.objects.create(
                        registration=registration,
                        course=course,
                        is_carry_over=False  # Admin can manually set this if needed
                    )
                
            elif action == 'add':
                # Add new courses to existing ones
                existing_course_ids = RegistrationCourse.objects.filter(
                    registration=registration
                ).values_list('course_id', flat=True)
                
                for course in courses:
                    if course.id not in existing_course_ids:
                        RegistrationCourse.objects.create(
                            registration=registration,
                            course=course,
                            is_carry_over=False
                        )
                
            elif action == 'remove':
                # Remove specified courses
                RegistrationCourse.objects.filter(
                    registration=registration,
                    course_id__in=course_ids
                ).delete()
            
            # Recalculate total units
            total_units = sum(
                reg_course.course.units 
                for reg_course in RegistrationCourse.objects.filter(registration=registration)
            )
            
            # Check unit limit
            if total_units > 24:
                return Response(
                    {'detail': f'Maximum units (24) exceeded. Total units would be {total_units}.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            registration.total_units = total_units
            registration.save()
            
            # Return updated registration
            serializer = self.get_serializer(registration)
            return Response({
                'detail': 'Courses updated successfully',
                'registration': serializer.data
            })

class RegistrationDetailView(generics.RetrieveAPIView):
    """View for admins to get specific registration details"""
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        # Only allow registration officers and admin to view registration details
        if not (user.user_type in ['registration_officer', 'hod'] or user.is_staff):
            raise Http404("Permission denied")
        
        return super().get_object()

class StudentRegistrationStatusView(generics.ListAPIView):
    """View for students to see their registration status"""
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Registration.objects.filter(student=user).order_by('-submitted_at')
        return Registration.objects.none()

class CourseAllocationViewSet(viewsets.ModelViewSet):
    serializer_class = CourseAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CourseAllocation.objects.filter(registered_students=self.request.user)

class RegisteredCoursesViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Course.objects.filter(
            courseallocations__registered_students=user
        )
