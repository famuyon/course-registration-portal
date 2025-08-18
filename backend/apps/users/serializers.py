from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from django.contrib.auth import get_user_model
from courses.models import Department
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Try to find user by username first
        user = User.objects.filter(username__iexact=username).first()
        
        # If not found, try matric number for students
        if not user:
            user = User.objects.filter(matric_number__iexact=username, user_type='student').first()
        
        if not user:
            raise serializers.ValidationError({'detail': 'No active account found with the given credentials'})
        
        # Authenticate using the actual username
        auth_user = authenticate(username=user.username, password=password)
        if not auth_user:
            raise serializers.ValidationError({'detail': 'No active account found with the given credentials'})
        
        # Update attrs with the actual username for the parent serializer
        attrs['username'] = user.username
        
        # Call parent validate method
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': user.user_type,
            'matric_number': user.matric_number,
            'department': user.department.name if user.department else None,
            'level': user.level,
            'phone_number': user.phone_number,
            'is_staff': user.is_staff
        }
        
        return data

class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff',
                 'user_type', 'matric_number', 'department', 'department_name', 'department_code',
                 'level', 'phone_number', 'profile_picture', 'signature')
        read_only_fields = ('id', 'is_staff', 'username', 'user_type')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name',
                 'user_type', 'matric_number', 'department', 'level', 'phone_number')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value 