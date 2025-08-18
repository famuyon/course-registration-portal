from django.core.management.base import BaseCommand
from django.utils import timezone
from courses.models import Department, Course, AcademicSession, CourseAllocation
from users.models import User
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Sets up YOUR custom courses for the course registration system'

    def handle(self, *args, **kwargs):
        # ========================================
        # STEP 1: SET UP DEPARTMENTS
        # ========================================
        # Add your departments here
        departments = {
            # Format: 'DEPT_CODE': 'Full Department Name'
            'CSC': 'Computer Science',
            'SEN': 'Software Engineering', 
            'MTH': 'Mathematics',
            'ENG': 'English Language',
            'PHY': 'Physics',
            # Add more departments as needed
        }
        
        created_departments = {}
        for code, name in departments.items():
            dept, created = Department.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'description': f'Department of {name}'
                }
            )
            created_departments[code] = dept
            if created:
                self.stdout.write(f'✅ Created department: {code} - {name}')
            else:
                self.stdout.write(f'📝 Department already exists: {code} - {name}')

        # ========================================
        # STEP 2: SET UP ACADEMIC SESSION
        # ========================================
        today = timezone.now().date()
        session, created = AcademicSession.objects.get_or_create(
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
        self.stdout.write('✅ Academic session ready!')

        # ========================================
        # STEP 3: YOUR CUSTOM COURSES
        # ========================================
        # 🎯 CUSTOMIZE YOUR COURSES HERE!
        # Copy this template and modify for each course you want:
        
        your_courses = [
            # 🎓 YOUR GRADUATE-LEVEL COURSES (500 Level)
            {
                'code': 'CSC508',
                'title': 'Modelling and Simulation',
                'department_code': 'CSC',
                'units': 2,
                'level': 500,
                'semester': 1,
                'description': 'Advanced techniques in computer modeling and simulation systems.'
            },
            {
                'code': 'CSC514',
                'title': 'Performance and Evaluation',
                'department_code': 'CSC',
                'units': 2,
                'level': 500,
                'semester': 1,
                'description': 'Performance analysis and evaluation of computer systems and applications.'
            },
            {
                'code': 'SEN502',
                'title': 'Software Review Techniques',
                'department_code': 'SEN',
                'units': 2,
                'level': 500,
                'semester': 1,
                'description': 'Advanced methods for software code review, inspection, and quality assurance.'
            },
            {
                'code': 'SEN504',
                'title': 'Software Engineering Economics',
                'department_code': 'SEN',
                'units': 2,
                'level': 500,
                'semester': 1,
                'description': 'Economic principles and cost analysis in software engineering projects.'
            },
            {
                'code': 'SEN506',
                'title': 'Recent Development in Software Engineering',
                'department_code': 'SEN',
                'units': 2,
                'level': 500,
                'semester': 2,
                'description': 'Current trends, research, and emerging practices in software engineering.'
            },
            {
                'code': 'SEN508',
                'title': 'Software Emerging Technologies',
                'department_code': 'SEN',
                'units': 2,
                'level': 500,
                'semester': 2,
                'description': 'Exploration of cutting-edge technologies and their application in software development.'
            },
            {
                'code': 'SEN510',
                'title': 'Data Storage Networks',
                'department_code': 'SEN',
                'units': 2,
                'level': 500,
                'semester': 2,
                'description': 'Design and implementation of distributed data storage and network systems.'
            },
            {
                'code': 'SEN512',
                'title': 'Big Data Analytics',
                'department_code': 'SEN',
                'units': 2,
                'level': 500,
                'semester': 2,
                'description': 'Advanced techniques for processing, analyzing, and extracting insights from big data.'
            }
        ]

        # Create the courses
        created_courses = []
        for course_data in your_courses:
            try:
                department = created_departments[course_data['department_code']]
                course, created = Course.objects.get_or_create(
                    code=course_data['code'],
                    defaults={
                        'title': course_data['title'],
                        'department': department,
                        'units': course_data['units'],
                        'level': course_data['level'],
                        'semester': course_data['semester'],
                        'description': course_data['description'],
                        'is_active': True
                    }
                )
                created_courses.append(course)
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✅ Created course: {course.code} - {course.title} ({course.units} units)'
                        )
                    )
                else:
                    self.stdout.write(f'📝 Course already exists: {course.code}')
                    
            except KeyError:
                self.stdout.write(
                    self.style.ERROR(
                        f'❌ Department {course_data["department_code"]} not found for course {course_data["code"]}'
                    )
                )

        # Create course allocations
        for course in created_courses:
            allocation, created = CourseAllocation.objects.get_or_create(
                course=course,
                session=session
            )
            if created:
                self.stdout.write(f'📋 Created allocation for {course.code}')

        # ========================================
        # FINAL SUMMARY
        # ========================================
        self.stdout.write(self.style.SUCCESS('\n🎉 YOUR CUSTOM COURSES ARE READY!'))
        self.stdout.write(self.style.WARNING('📊 Summary:'))
        self.stdout.write(f'   📚 Departments: {len(created_departments)}')
        self.stdout.write(f'   📖 Courses: {len(created_courses)}')
        self.stdout.write('\n💡 To modify courses:')
        self.stdout.write('   1. Edit this file: courses/management/commands/setup_my_courses.py')
        self.stdout.write('   2. Run: python manage.py setup_my_courses')
        self.stdout.write('\n🌐 Or use Django Admin:')
        self.stdout.write('   Visit: http://127.0.0.1:8000/admin/')
        self.stdout.write('   Login: admin / admin123') 