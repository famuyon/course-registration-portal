from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    CourseDetailView,
    AcademicSessionListView,
    AcademicSessionDetailView,
    CourseAllocationListView,
    DepartmentViewSet,
    RegisteredCoursesViewSet,
    CourseAllocationViewSet,
    PendingRegistrationsView,
    AllRegistrationsView,
    ApproveRegistrationView,
    EditRegistrationCoursesView,
    RegistrationDetailView,
    StudentRegistrationStatusView
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='courses')
router.register(r'departments', DepartmentViewSet, basename='departments')
router.register(r'registered', RegisteredCoursesViewSet, basename='registered-courses')
router.register(r'allocations', CourseAllocationViewSet, basename='course-allocation')

app_name = 'courses'

urlpatterns = [
    path('', include(router.urls)),
    path('sessions/', AcademicSessionListView.as_view(), name='session-list'),
    path('registrations/pending/', PendingRegistrationsView.as_view(), name='pending-registrations'),
    path('registrations/all/', AllRegistrationsView.as_view(), name='all-registrations'),
    path('registrations/<int:pk>/', RegistrationDetailView.as_view(), name='registration-detail'),
    path('registrations/<int:pk>/approve/', ApproveRegistrationView.as_view(), name='approve-registration'),
    path('registrations/<int:pk>/edit_courses/', EditRegistrationCoursesView.as_view(), name='edit-registration-courses'),
    path('registrations/status/', StudentRegistrationStatusView.as_view(), name='registration-status'),
]