from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Course(models.Model):
    LEVEL_CHOICES = [
        (100, '100'),
        (200, '200'),
        (300, '300'),
        (400, '400'),
        (500, '500'),
    ]
    
    SEMESTER_CHOICES = [
        (1, 'First'),
        (2, 'Second'),
    ]

    code = models.CharField(max_length=10)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    units = models.IntegerField()
    level = models.IntegerField(choices=LEVEL_CHOICES, default=500)
    semester = models.IntegerField(choices=SEMESTER_CHOICES, default=2)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='prerequisite_for')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.title}"

class AcademicSession(models.Model):
    name = models.CharField(max_length=20)
    start_date = models.DateField(default='2024-01-01')
    end_date = models.DateField(default='2024-12-31')
    registration_start_date = models.DateField()
    registration_end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class CourseAllocation(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='courseallocations')
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE, related_name='course_allocations')
    registered_students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='allocated_courses')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['course__code']
        unique_together = ('course', 'session')

    def __str__(self):
        return f"{self.course.code} - {self.course.title} ({self.session.name})"

    @property
    def current_capacity(self):
        """Get the current number of registered students."""
        return self.registered_students.count()

    @property
    def max_capacity(self):
        """Default maximum capacity."""
        return 60

    def can_register(self, student):
        """Check if a student can register for this course."""
        if self.current_capacity >= self.max_capacity:
            return False, "Course is full"
        
        if self.registered_students.filter(id=student.id).exists():
            return False, "Already registered for this course"
            
        # Check prerequisites
        if self.course.prerequisites.exists():
            # Get student's completed courses from previous sessions
            completed_courses = set(
                CourseAllocation.objects.filter(
                    registered_students=student,
                    session__registration_end_date__lt=self.session.registration_start_date
                ).values_list('course_id', flat=True)
            )
            
            missing_prerequisites = self.course.prerequisites.exclude(id__in=completed_courses)
            if missing_prerequisites.exists():
                prereq_codes = ", ".join([c.code for c in missing_prerequisites])
                return False, f"Missing prerequisites: {prereq_codes}"
        
        return True, "Eligible for registration"
