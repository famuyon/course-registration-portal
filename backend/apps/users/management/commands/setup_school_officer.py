from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Department

User = get_user_model()

class Command(BaseCommand):
    help = 'Create or update the school officer user'

    def handle(self, *args, **options):
        try:
            # Get or create a default department
            department, created = Department.objects.get_or_create(
                name='Administration',
                defaults={'code': 'ADMIN'}
            )
            
            # Create or update school officer user
            user, created = User.objects.get_or_create(
                username='schoolofficer',
                defaults={
                    'email': 'schoolofficer@example.com',
                    'first_name': 'Dr. Sarah',
                    'last_name': 'Johnson',
                    'user_type': 'school_officer',
                    'department': department,
                    'is_staff': False,
                    'is_active': True,
                }
            )
            
            # Set password
            user.set_password('schoolofficer123')
            user.user_type = 'school_officer'  # Ensure correct user type
            user.save()
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created school officer user: {user.username}')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully updated school officer user: {user.username}')
                )
                
            self.stdout.write(
                self.style.SUCCESS(f'Username: schoolofficer')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Password: schoolofficer123')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating school officer user: {str(e)}')
            ) 