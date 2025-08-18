from django.contrib import admin
from .models import Course, Department, CourseAllocation

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'title', 'units', 'department', 'semester', 'level']
    list_filter = ['department', 'semester', 'level']
    search_fields = ['code', 'title']

@admin.register(CourseAllocation)
class CourseAllocationAdmin(admin.ModelAdmin):
    list_display = ['course', 'get_registered_students_count']
    list_filter = ['course__department', 'course__semester']
    search_fields = ['course__code', 'course__title']

    def get_registered_students_count(self, obj):
        return obj.registered_students.count()
    get_registered_students_count.short_description = 'Registered Students'
