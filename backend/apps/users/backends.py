from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class UsernameOrMatricBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        user = None
        if username is not None:
            try:
                user = User.objects.get(username__iexact=username)
            except User.DoesNotExist:
                # Try matric number for students
                try:
                    user = User.objects.get(matric_number__iexact=username, user_type='student')
                except User.DoesNotExist:
                    return None
            if user and user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None 