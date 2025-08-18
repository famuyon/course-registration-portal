from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('registration_officer', 'Registration Officer'),
        ('hod', 'Head of Department'),
        ('school_officer', 'School Officer'),
    )

    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    matric_number = models.CharField(max_length=20, blank=True, null=True)
    department = models.ForeignKey('courses.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    level = models.IntegerField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)
    registered_courses = models.ManyToManyField('courses.Course', related_name='registered_students', blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    signature = models.ImageField(upload_to='signatures/', blank=True, null=True, help_text="Digital signature for admin users")

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['username']

    def __str__(self):
        return f"{self.username} - {self.get_user_type_display()}"
