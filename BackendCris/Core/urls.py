from django.urls import path , include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'partituras', views.PartituraViewSet, basename='partituras')

urlpatterns = [
    path('', views.hola, name='hola_mundo'),
    path('partiture/', views.partiture, name='partiture'),
    path('partiture_list/', views.partiture_list, name='partiture_list'),
    path('', include(router.urls)),
]
