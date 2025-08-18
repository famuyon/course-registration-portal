from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'department', 'level')
    list_filter = ('user_type', 'department', 'level', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'matric_number')
    ordering = ('username',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number')}),
        ('Academic info', {'fields': ('user_type', 'matric_number', 'department', 'level')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'user_type', 'email', 'first_name', 'last_name'),
        }),
    )

admin.site.register(User, CustomUserAdmin)
