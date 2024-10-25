from django.shortcuts import render, redirect
# Create your views here.
from django.http import HttpResponse

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