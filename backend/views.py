from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

@api_view(['GET'])
def api_root(request, format=None):
    """
    API root endpoint that provides links to all major endpoints.
    """
    return Response({
        'message': 'Course Registration Portal API',
        'courses': reverse('courses:courses-list', request=request, format=format),
        'departments': reverse('courses:departments-list', request=request, format=format),
        'sessions': reverse('courses:session-list', request=request, format=format),
        'registrations': reverse('registration:registration-list', request=request, format=format),
        'registered-courses': reverse('courses:registered-courses-list', request=request, format=format),
        'auth': {
            'login': reverse('token_obtain_pair', request=request, format=format),
            'refresh': reverse('token_refresh', request=request, format=format),
            'profile': reverse('user-profile', request=request, format=format),
            'register': reverse('users:register', request=request, format=format),
        }
    }) 