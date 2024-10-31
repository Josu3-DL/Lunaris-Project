from django.shortcuts import render, redirect
# Create your views here.
from django.http import HttpResponse

from rest_framework import viewsets, serializers, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny # esto es para el permiso
from .serializers import PartituraSerializer

from .models import Partitura

def hola(request):
    return HttpResponse("¡Hola, mundo!")

def partiture(request):
    if request.method == 'POST':
        titulo = request.POST.get('titulo')
        autor = request.POST.get('autor')
        descripcion = request.POST.get('descripcion')
        archivo = request.FILES['archivo']  # archivo subido

        # Guardar la partitura
        partitura = Partitura(titulo=titulo, autor=autor, descripcion=descripcion, archivo=archivo)
        partitura.save()

        # Obtener las notas y transponer
        partitura.get_notes()

        # Redirigir a una página de éxito o simplemente renderizar de nuevo
        return redirect('/')  # Define una URL para redirigir después del éxito
    else:
        return render(request, 'Core/index.html')



def partiture_list(request):
    partituras = Partitura.objects.all()
    return render(request, 'Core/partiture_list.html', {'partituras': partituras})

class PartituraViewSet(viewsets.ModelViewSet):
    queryset = Partitura.objects.all()
    serializer_class = PartituraSerializer
    permission_classes = [AllowAny] # esto es para que pueda acceder sin necesidad de estar autenticado
    authentication_classes = [BasicAuthentication]

    def perform_create(self, serializer):
        partitura = serializer.save()
        partitura.get_notes()  # Ejecuta el procesamiento de notas después de crear la partitura

    def perform_update(self, serializer):
        partitura = serializer.save()
        partitura.get_notes()  # Ejecuta el procesamiento de notas después de actualizar la partitura
    
    @action(detail=True, methods=['post'], url_path='notas')
    def generar_notas(self, request, pk=None):
        try:
            partitura = self.get_object()
            intervalo = request.data.get("invervalo", "M2")
            partitura.get_notes(intervalo_transposicion=intervalo)
            return Response({'status': "Nota creada exitosamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'],url_path='metadata')
    def obtener_metadata(self, request, pk=None):
        try:
            partitura = self.get_object()
            serializer = self.get_serializer(partitura)
            return Response(serializer, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)