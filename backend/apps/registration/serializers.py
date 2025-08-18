from rest_framework import serializers
from .models import Registration, RegistrationCourse, RegistrationApproval, RegistrationSignature, Result
from users.serializers import UserSerializer
from courses.serializers import CourseSerializer, DepartmentSerializer, AcademicSessionSerializer

class RegistrationSignatureSerializer(serializers.ModelSerializer):
    signed_by = UserSerializer(read_only=True)
    signature_url = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationSignature
        fields = ('id', 'signed_by', 'signed_at', 'signature_name', 'signature_title', 'signature_url')
        read_only_fields = ('signed_at',)

    def get_signature_url(self, obj):
        request = self.context.get('request')
        if obj.signed_by.signature and request:
            return request.build_absolute_uri(obj.signed_by.signature.url)
        return None

class RegistrationCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = RegistrationCourse
        fields = ('id', 'course', 'course_id', 'is_carry_over')

class RegistrationApprovalSerializer(serializers.ModelSerializer):
    approved_by = UserSerializer(read_only=True)
    approved_by_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = RegistrationApproval
        fields = ('id', 'approved_by', 'approved_by_id', 'approved_at',
                 'comments', 'signature')
        read_only_fields = ('approved_at',)

class RegistrationSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True)
    session = AcademicSessionSerializer(read_only=True)
    session_id = serializers.IntegerField(write_only=True)
    courses = RegistrationCourseSerializer(many=True, read_only=True)
    approvals = RegistrationApprovalSerializer(many=True, read_only=True)
    signatures = RegistrationSignatureSerializer(many=True, read_only=True)
    signature_appended = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = ('id', 'student', 'student_id', 'session', 'session_id',
                 'department', 'department_id', 'level', 'semester', 'status',
                 'submitted_at', 'updated_at', 'total_units', 'courses', 'approvals', 
                 'signatures', 'signature_appended', 'comments')
        read_only_fields = ('submitted_at', 'updated_at', 'total_units', 'status')

    def get_signature_appended(self, obj):
        return obj.signatures.exists()

    def validate(self, attrs):
        # Check if registration window is open
        session = attrs.get('session')
        if session and hasattr(attrs, 'submitted_at'):
            if not (session.registration_start_date <= attrs['submitted_at'].date() <= session.registration_end_date):
                raise serializers.ValidationError("Registration is not open for this session.")
        return attrs

class ResultSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)
    session = AcademicSessionSerializer(read_only=True)
    session_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Result
        fields = ('id', 'student', 'student_id', 'course', 'course_id',
                 'session', 'session_id', 'grade', 'score')

    def validate_score(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Score must be between 0 and 100.")
        return value

    def validate(self, attrs):
        # Calculate grade based on score
        score = attrs['score']
        if score >= 70:
            attrs['grade'] = 'A'
        elif score >= 60:
            attrs['grade'] = 'B'
        elif score >= 50:
            attrs['grade'] = 'C'
        elif score >= 45:
            attrs['grade'] = 'D'
        elif score >= 40:
            attrs['grade'] = 'E'
        else:
            attrs['grade'] = 'F'
        return attrs 