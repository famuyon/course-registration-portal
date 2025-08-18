from django.shortcuts import render
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
import os
from .models import Registration, RegistrationCourse, RegistrationApproval, RegistrationSignature, Result
from .serializers import (
    RegistrationSerializer,
    RegistrationCourseSerializer,
    RegistrationApprovalSerializer,
    ResultSerializer
)

# Create your views here.

class RegistrationListView(generics.ListCreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'session', 'department', 'level', 'semester']

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Registration.objects.filter(student=user)
        elif user.user_type in ['registration_officer', 'hod', 'school_officer'] or user.is_staff:
            # Admin users (registration officers, HODs, school officers, staff) can see all registrations
            return Registration.objects.all().order_by('-submitted_at')
        return Registration.objects.none()

class RegistrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Registration.objects.filter(student=user)
        return Registration.objects.all()

class AppendSignatureView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        
        # Check if user is admin
        if not (user.user_type in ['registration_officer', 'hod', 'school_officer'] or user.is_staff):
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if user has uploaded signature
        if not user.signature:
            return Response(
                {'detail': 'Please upload your signature first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get registration
        registration = get_object_or_404(Registration, pk=pk)
        
        # Check if registration is approved
        if registration.status != 'approved':
            return Response(
                {'detail': 'Registration must be approved before signature can be appended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already signed this registration
        existing_signature = RegistrationSignature.objects.filter(
            registration=registration,
            signed_by=user
        ).first()
        
        if existing_signature:
            return Response(
                {'detail': 'You have already signed this registration'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get existing signatures for this registration
        existing_signatures = RegistrationSignature.objects.filter(registration=registration)
        
        # Define the required signature order
        signature_order = ['registration_officer', 'hod', 'school_officer']
        
        # Get current user's position in the order
        try:
            current_position = signature_order.index(user.user_type)
        except ValueError:
            return Response(
                {'detail': 'Invalid user type for signature order'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # If this is not the first signature (registration_officer)
        if current_position > 0:
            # Check if the previous role has signed
            previous_role = signature_order[current_position - 1]
            previous_signature = existing_signatures.filter(
                signed_by__user_type=previous_role
            ).first()
            
            if not previous_signature:
                return Response(
                    {'detail': f'The {previous_role.replace("_", " ").title()} must sign before you'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # If this is not the last signature, check no one after has signed yet
        if current_position < len(signature_order) - 1:
            next_signatures = existing_signatures.filter(
                signed_by__user_type__in=signature_order[current_position + 1:]
            )
            
            if next_signatures.exists():
                return Response(
                    {'detail': 'Cannot insert signature before later signatories who have already signed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Determine signature name and title
        signature_name = f"{user.first_name} {user.last_name}".strip() if user.first_name or user.last_name else user.username
        
        if user.user_type == 'registration_officer':
            signature_title = 'Registration Officer'
        elif user.user_type == 'hod':
            signature_title = 'Head of Department'
        elif user.user_type == 'school_officer':
            signature_title = 'School Officer'
        else:
            signature_title = 'Administrator'
        
        # Create signature record
        signature = RegistrationSignature.objects.create(
            registration=registration,
            signed_by=user,
            signature_name=signature_name,
            signature_title=signature_title
        )

        # If this is the school officer (last signature), send email to student
        if user.user_type == 'school_officer':
            student = registration.student
            if student.email:
                # Get the frontend URL from environment variable or use a default
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                form_url = f"{frontend_url}/registration/print/{registration.id}"
                
                subject = 'Course Registration Form'
                message = f"""Dear {student.first_name or student.username},

We are pleased to inform you that your course form has been approved for the semester and fully signed by all the required officials

Go to your dashbboard and print out your course form for submission"""

                try:
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[student.email],
                        fail_silently=True
                    )
                except Exception as e:
                    # Log the error but don't prevent the signature from being saved
                    print(f"Failed to send email to student: {e}")
        
        return Response({
            'detail': 'Signature appended successfully',
            'signature_id': signature.id,
            'signature_name': signature_name,
            'signature_title': signature_title
        }, status=status.HTTP_201_CREATED)

class RegistrationCourseListView(generics.ListCreateAPIView):
    serializer_class = RegistrationCourseSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['registration', 'course', 'is_carry_over']

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return RegistrationCourse.objects.filter(registration__student=user)
        return RegistrationCourse.objects.all()

class RegistrationCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RegistrationCourseSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return RegistrationCourse.objects.filter(registration__student=user)
        return RegistrationCourse.objects.all()

class RegistrationApprovalListView(generics.ListCreateAPIView):
    serializer_class = RegistrationApprovalSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['registration', 'approved_by']

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return RegistrationApproval.objects.filter(registration__student=user)
        elif user.user_type in ['registration_officer', 'hod']:
            return RegistrationApproval.objects.filter(approved_by=user)
        return RegistrationApproval.objects.all()

class RegistrationApprovalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RegistrationApprovalSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return RegistrationApproval.objects.filter(registration__student=user)
        elif user.user_type in ['registration_officer', 'hod']:
            return RegistrationApproval.objects.filter(approved_by=user)
        return RegistrationApproval.objects.all()

class ResultListView(generics.ListCreateAPIView):
    serializer_class = ResultSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'course', 'grade']

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Result.objects.filter(student=user)
        return Result.objects.all()

class ResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResultSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Result.objects.filter(student=user)
        return Result.objects.all()

class PrintRegistrationFormView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        registration = get_object_or_404(Registration, pk=pk)
        
        # Check permissions
        user = request.user
        if user.user_type == 'student' and registration.student != user:
            return Response(
                {"detail": "You do not have permission to view this registration form."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Include signature information
        signatures = RegistrationSignature.objects.filter(registration=registration)
        signature_data = []
        
        for sig in signatures:
            signature_url = None
            if sig.signed_by.signature:
                if sig.signed_by.signature.url.startswith('http'):
                    signature_url = sig.signed_by.signature.url
                else:
                    signature_url = request.build_absolute_uri(sig.signed_by.signature.url)
            
            signature_data.append({
                'name': sig.signature_name,
                'title': sig.signature_title,
                'signed_at': sig.signed_at,
                'signature_url': signature_url
            })

        serializer = RegistrationSerializer(registration)
        response_data = serializer.data
        response_data['signatures'] = signature_data
        
        return Response(response_data)
