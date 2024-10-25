from django.urls import path
from . import views

urlpatterns = [
    path('', views.hola, name='hola_mundo'),
    path('partiture/', views.partiture, name='partiture'),
    path('partiture_list/', views.partiture_list, name='partiture_list'),
]
