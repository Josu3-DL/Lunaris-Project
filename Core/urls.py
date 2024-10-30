from rest_framework import routers
from .views import UserViewsets
from django.urls import path, include
from .views import LoginView

router = routers.DefaultRouter()

router.register(r'user',UserViewsets)

urlpatterns = [
    path('',include(router.urls)),
    path('login/',LoginView.as_view(),name = "login"),
]
