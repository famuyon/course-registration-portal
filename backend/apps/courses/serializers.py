from rest_framework import serializers
from .models import Department, Course, AcademicSession, CourseAllocation
from users.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    hod = UserSerializer(read_only=True)
    hod_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Department
        fields = ('id', 'name', 'code', 'hod', 'hod_id')

class CourseSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True)
    prerequisites = serializers.PrimaryKeyRelatedField(many=True, queryset=Course.objects.all(), required=False)
    is_registered = serializers.SerializerMethodField()
    enrolled_students = serializers.SerializerMethodField()
    capacity = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'code', 'title', 'description', 'department', 'department_id', 'level', 
                 'semester', 'units', 'is_active', 'prerequisites',
                 'is_registered', 'enrolled_students', 'capacity')

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Import here to avoid circular imports
        from registration.models import RegistrationCourse, Registration
        
        # Check if user has an approved registration containing this course
        return RegistrationCourse.objects.filter(
            course=obj,
            registration__student=request.user,
            registration__status='approved'
        ).exists()

    def get_enrolled_students(self, obj):
        allocation = CourseAllocation.objects.filter(course=obj).first()
        return allocation.registered_students.count() if allocation else 0

    def get_capacity(self, obj):
        allocation = CourseAllocation.objects.filter(course=obj).first()
        return 50  # Default capacity

    def to_representation(self, instance):
        data = super().to_representation(instance)
        print(f"Serializing course {instance.code}: {data}")  # Debug log
        return data

class AcademicSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicSession
        fields = ('id', 'name', 'start_date', 'end_date', 'is_current',
                 'registration_start_date', 'registration_end_date')

    def validate(self, attrs):
        if attrs.get('is_current', False):
            # Ensure only one session is current
            AcademicSession.objects.exclude(id=self.instance.id if self.instance else None).update(is_current=False)
        return attrs

class CourseAllocationSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    session = AcademicSessionSerializer(read_only=True)

    class Meta:
        model = CourseAllocation
        fields = ('id', 'course', 'department', 'session', 'max_capacity', 'current_capacity')

    def validate(self, attrs):
        if attrs.get('max_capacity', 0) < attrs.get('current_capacity', 0):
            raise serializers.ValidationError(
                {"max_capacity": "Maximum capacity cannot be less than current capacity."})
        return attrs