from django.contrib import admin
from .models import Registration, RegistrationCourse, RegistrationApproval, Result

class RegistrationCourseInline(admin.TabularInline):
    model = RegistrationCourse
    extra = 0

class RegistrationApprovalInline(admin.TabularInline):
    model = RegistrationApproval
    extra = 0
    readonly_fields = ('approved_at',)

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'department', 'level', 'semester', 'status', 'total_units', 'submitted_at')
    list_filter = ('status', 'session', 'department', 'level', 'semester')
    search_fields = ('student__username', 'student__first_name', 'student__last_name')
    readonly_fields = ('submitted_at', 'updated_at')
    inlines = [RegistrationCourseInline, RegistrationApprovalInline]

@admin.register(RegistrationCourse)
class RegistrationCourseAdmin(admin.ModelAdmin):
    list_display = ('registration', 'course', 'is_carry_over')
    list_filter = ('is_carry_over', 'course__department')
    search_fields = ('registration__student__username', 'course__code', 'course__title')

@admin.register(RegistrationApproval)
class RegistrationApprovalAdmin(admin.ModelAdmin):
    list_display = ('registration', 'approved_by', 'approved_at')
    list_filter = ('approved_by', 'approved_at')
    search_fields = ('registration__student__username', 'approved_by__username')
    readonly_fields = ('approved_at',)

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'session', 'grade', 'score')
    list_filter = ('grade', 'session', 'course__department')
    search_fields = ('student__username', 'course__code', 'course__title')

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return ('student', 'course', 'session')
        return ()
