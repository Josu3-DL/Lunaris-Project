from rest_framework import routers
from .views import UserViewsets,PartitureViewsets
from django.urls import path, include
from .views import LoginView,Partitura

router = routers.DefaultRouter()

router.register(r'user',UserViewsets)
router.register(r'partiture',PartitureViewsets)

urlpatterns = [
    path('',include(router.urls)),
    path('login/',LoginView.as_view(),name = "login"),
  
   
    
]
