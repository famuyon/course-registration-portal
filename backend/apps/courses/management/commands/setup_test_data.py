from django.core.management.base import BaseCommand
from django.utils import timezone
from courses.models import Department, Course, AcademicSession, CourseAllocation
from users.models import User
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Sets up test data for the course registration system'

    def handle(self, *args, **kwargs):
        # Create test departments
        sen_dept, _ = Department.objects.get_or_create(
            code='SEN',
            defaults={
                'name': 'Software Engineering',
                'description': 'Department of Software Engineering'
            }
        )
        cs_dept, _ = Department.objects.get_or_create(
            code='CSC',
            defaults={
                'name': 'Computer Science',
                'description': 'Department of Computer Science'
            }
        )
        math_dept, _ = Department.objects.get_or_create(
            code='MTH',
            defaults={
                'name': 'Mathematics',
                'description': 'Department of Mathematics'
            }
        )
        self.stdout.write(self.style.SUCCESS('Created/Retrieved departments'))

        # Create academic session
        today = timezone.now().date()
        session, _ = AcademicSession.objects.get_or_create(
            name='2025/2026',
            defaults={
                'start_date': today,
                'end_date': today + timedelta(days=365),
                'registration_start_date': today - timedelta(days=7),
                'registration_end_date': today + timedelta(days=30),
                'is_current': True
            }
        )
        session.is_current = True
        session.save()
        self.stdout.write(self.style.SUCCESS('Created/Retrieved academic session'))

        # Create test courses
        courses_data = [
            {
                'code': 'CSC101',
                'title': 'Introduction to Python Programming',
                'department': cs_dept,
                'units': 3,
                'level': 100,
                'semester': 1,
                'description': 'Learn the basics of Python programming language.'
            },
            {
                'code': 'SEN201',
                'title': 'Java Programming',
                'department': sen_dept,
                'units': 3,
                'level': 200,
                'semester': 1,
                'description': 'Introduction to Java programming and object-oriented concepts.'
            },
            {
                'code': 'SEN202',
                'title': 'Web Development',
                'department': sen_dept,
                'units': 3,
                'level': 200,
                'semester': 1,
                'description': 'Introduction to web development using modern frameworks.'
            },
            {
                'code': 'MTH101',
                'title': 'Calculus I',
                'department': math_dept,
                'units': 4,
                'level': 100,
                'semester': 1,
                'description': 'Introduction to differential and integral calculus.'
            },
            {
                'code': 'SEN301',
                'title': 'Software Engineering Principles',
                'department': sen_dept,
                'units': 3,
                'level': 300,
                'semester': 2,
                'description': 'Fundamental principles of software engineering.'
            },
            {
                'code': 'CSC201',
                'title': 'Data Structures and Algorithms',
                'department': cs_dept,
                'units': 4,
                'level': 200,
                'semester': 2,
                'description': 'Study of fundamental data structures and algorithms.'
            }
        ]

        created_courses = []
        for course_data in courses_data:
            course, _ = Course.objects.get_or_create(
                code=course_data['code'],
                defaults=course_data
            )
            created_courses.append(course)
        
        self.stdout.write(self.style.SUCCESS('Created/Retrieved courses'))

        # Create course allocations for the current session
        for course in created_courses:
            allocation, created = CourseAllocation.objects.get_or_create(
                course=course,
                session=session
            )
            if created:
                self.stdout.write(f'Created allocation for {course.code}')
        
        self.stdout.write(self.style.SUCCESS('Created/Retrieved course allocations'))

        # Create test users
        users_data = [
            {
                'username': 'student1',
                'email': 'student1@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'user_type': 'student',
                'department': sen_dept,
                'level': 200,
                'matric_number': 'SEN/2023/001'
            },
            {
                'username': 'student2',
                'email': 'student2@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'user_type': 'student',
                'department': cs_dept,
                'level': 300,
                'matric_number': 'CSC/2022/001'
            },
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'user_type': 'registration_officer',
                'department': sen_dept,
                'is_staff': True
            },
            {
                'username': 'HOD',
                'email': 'hod@example.com',
                'first_name': 'Head',
                'last_name': 'Department',
                'user_type': 'hod',
                'department': sen_dept,
                'is_staff': True
            }
        ]

        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                # Set different passwords for different user types
                if user_data['username'] == 'HOD':
                    user.set_password('HOD123')
                else:
                    user.set_password('password123')
                user.is_active = True
                user.save()
                self.stdout.write(f'Created user: {user.username}')
            else:
                self.stdout.write(f'User already exists: {user.username}')

        self.stdout.write(self.style.SUCCESS('All test data has been created successfully!'))
        self.stdout.write(self.style.WARNING('Test users credentials:'))
        self.stdout.write('  Username: student1, Password: password123')
        self.stdout.write('  Username: student2, Password: password123')
        self.stdout.write('  Username: admin, Password: password123')
        self.stdout.write('  Username: HOD, Password: HOD123') 