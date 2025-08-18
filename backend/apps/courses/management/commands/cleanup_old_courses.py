from django.core.management.base import BaseCommand
from courses.models import Course, CourseAllocation
from registration.models import RegistrationCourse

class Command(BaseCommand):
    help = 'Remove old demo courses and keep only the new graduate-level courses'

    def handle(self, *args, **kwargs):
        # List of courses to KEEP (your new graduate courses)
        courses_to_keep = [
            'CSC508', 'CSC514', 'SEN502', 'SEN504', 
            'SEN506', 'SEN508', 'SEN510', 'SEN512'
        ]
        
        # Find all courses that are NOT in the keep list
        old_courses = Course.objects.exclude(code__in=courses_to_keep)
        
        self.stdout.write('🗑️  Found old courses to remove:')
        for course in old_courses:
            self.stdout.write(f'   - {course.code}: {course.title}')
        
        if old_courses.exists():
            # Remove course registrations first
            registrations_deleted = RegistrationCourse.objects.filter(course__in=old_courses).delete()
            self.stdout.write(f'📋 Removed {registrations_deleted[0]} course registrations')
            
            # Remove course allocations
            allocations_deleted = CourseAllocation.objects.filter(course__in=old_courses).delete()
            self.stdout.write(f'📅 Removed {allocations_deleted[0]} course allocations')
            
            # Remove the courses themselves
            courses_count = old_courses.count()
            old_courses.delete()
            self.stdout.write(self.style.SUCCESS(f'✅ Removed {courses_count} old courses'))
        else:
            self.stdout.write('📝 No old courses found to remove')
        
        # Show remaining courses
        remaining_courses = Course.objects.all().order_by('code')
        self.stdout.write('\n🎓 Remaining courses in system:')
        for course in remaining_courses:
            self.stdout.write(f'   ✅ {course.code}: {course.title} ({course.units} units, Level {course.level})')
        
        self.stdout.write(self.style.SUCCESS('\n🎉 Cleanup completed! Only your graduate courses remain.'))
        self.stdout.write('🌐 Visit http://localhost:3000 to see the updated course list.') 