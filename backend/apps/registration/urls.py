from django.urls import path
from . import views

app_name = 'registration'

urlpatterns = [
    path('registrations/', views.RegistrationListView.as_view(), name='registration-list'),
    path('registrations/<int:pk>/', views.RegistrationDetailView.as_view(), name='registration-detail'),
    path('registrations/<int:pk>/append-signature/', views.AppendSignatureView.as_view(), name='append-signature'),
    path('registration-courses/', views.RegistrationCourseListView.as_view(), name='registration-course-list'),
    path('registration-courses/<int:pk>/', views.RegistrationCourseDetailView.as_view(), name='registration-course-detail'),
    path('registration-approvals/', views.RegistrationApprovalListView.as_view(), name='registration-approval-list'),
    path('registration-approvals/<int:pk>/', views.RegistrationApprovalDetailView.as_view(), name='registration-approval-detail'),
    path('results/', views.ResultListView.as_view(), name='result-list'),
    path('results/<int:pk>/', views.ResultDetailView.as_view(), name='result-detail'),
    path('print/<int:pk>/', views.PrintRegistrationFormView.as_view(), name='print-registration-form'),
] 