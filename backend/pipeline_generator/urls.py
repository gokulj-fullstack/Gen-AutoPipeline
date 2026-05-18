from django.urls import path
from . import views

urlpatterns = [
    path('generate-pipeline/',   views.generate_pipeline),
    path('github-analyze/',      views.github_analyze),
    path('github-login/',        views.github_login),
    path('github-callback/',     views.github_callback),

    # New automation endpoints
    path('push-yaml/',           views.push_yaml),
    path('manage-branch/',       views.manage_branch),
]