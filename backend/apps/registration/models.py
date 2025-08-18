from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from courses.models import Course, AcademicSession, Department

class Registration(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    level = models.IntegerField(validators=[MinValueValidator(100), MaxValueValidator(800)])
    semester = models.CharField(max_length=1, choices=[('1', 'First'), ('2', 'Second')])
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total_units = models.IntegerField(default=0)
    comments = models.TextField(blank=True, null=True, help_text="Optional comments from student for registration officer")

    class Meta:
        unique_together = ('student', 'session', 'semester')

    def __str__(self):
        return f"{self.student.username} - {self.session.name} ({self.get_semester_display()} Semester)"

class RegistrationCourse(models.Model):
    registration = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    is_carry_over = models.BooleanField(default=False)

    class Meta:
        unique_together = ('registration', 'course')

    def __str__(self):
        return f"{self.registration.student.username} - {self.course.code}"

class RegistrationApproval(models.Model):
    registration = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='approvals')
    approved_by = models.ForeignKey(User, on_delete=models.CASCADE)
    approved_at = models.DateTimeField(auto_now_add=True)
    comments = models.TextField(blank=True, null=True)
    signature = models.ImageField(upload_to='signatures/', blank=True, null=True)

    def __str__(self):
        return f"{self.registration.student.username}'s registration approved by {self.approved_by.username}"

class RegistrationSignature(models.Model):
    """Track signatures appended to approved registrations"""
    registration = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='signatures')
    signed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signed_registrations')
    signed_at = models.DateTimeField(auto_now_add=True)
    signature_name = models.CharField(max_length=255, help_text="Name to display with signature")
    signature_title = models.CharField(max_length=255, help_text="Title/role of the signatory")

    class Meta:
        unique_together = ('registration', 'signed_by')

    def __str__(self):
        return f"{self.registration.student.username}'s registration signed by {self.signed_by.username}"

class Result(models.Model):
    GRADE_CHOICES = (
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('E', 'E'),
        ('F', 'F'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='results')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    grade = models.CharField(max_length=1, choices=GRADE_CHOICES)
    score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        unique_together = ('student', 'course', 'session')

    def __str__(self):
        return f"{self.student.username} - {self.course.code} - {self.grade}"
