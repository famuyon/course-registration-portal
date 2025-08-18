from django.core.management.base import BaseCommand
from registration.models import Registration

class Command(BaseCommand):
    help = 'Clean up empty registrations with 0 total units'

    def handle(self, *args, **options):
        # Find registrations with 0 total units
        empty_registrations = Registration.objects.filter(total_units=0)
        count = empty_registrations.count()
        
        if count > 0:
            self.stdout.write(f'Found {count} empty registrations with 0 total units:')
            for reg in empty_registrations:
                self.stdout.write(f'  - Registration ID {reg.id}: {reg.student.username} - {reg.status} ({reg.total_units} units)')
            
            # Delete empty registrations
            empty_registrations.delete()
            self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} empty registrations'))
        else:
            self.stdout.write(self.style.SUCCESS('No empty registrations found - database is clean!')) 