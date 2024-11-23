from django.db import models
from django.contrib.auth.models import User
from music21 import converter, note, interval
from midi2audio import FluidSynth

class Partitura(models.Model):
    titulo = models.CharField(max_length=100, null=False, blank=False)
    autor = models.CharField(max_length=100, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    archivo = models.FileField(upload_to='partituras/', null=False, blank=False)
    notas_transpuestas = models.JSONField(null=True, blank=True)
    notas_normales = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # nuevos campos
    time_signature = models.CharField(max_length=10, null=True, blank=True)
    key_signature = models.CharField(max_length=20, null=True, blank=True)  # se aumenta el max_length para mostrar mayor/menor
    clef = models.CharField(max_length=10, null=True, blank=True)

    # Función para convertir la duración a formato de letras de VexFlow
    def duration_to_vexflow(self, duration, is_rest=False):
        if duration == 4.0 or duration == 6.0:
            return "wr" if is_rest else "w"
        elif duration == 2.0 or duration == 3.0:
            return "hr" if is_rest else "h"
        elif duration == 1.0 or duration == 1.5:
            return "qr" if is_rest else "q"
        elif duration == 0.5 or duration == 0.75:
            return "8r" if is_rest else "8"
        elif duration == 0.25 or duration == 0.375:
            return "16r" if is_rest else "16"
        elif duration == 0.125 or duration == 0.1875:
            return "32r" if is_rest else "32"
        elif duration == 0.0625 or duration == 0.09375:
            return "64r" if is_rest else "64"
        elif duration == 2/3:
            return "ir" if is_rest else "i"
        elif duration == 0.0:
            return "8r" if is_rest else "8"  # Nota de gracia como corchea
        else:
            return f"duración desconocida ({duration})"

    # Función para determinar el accidental y si la nota está punteada
    def get_note_attributes(self, n):
        if n.pitch.accidental:
            if n.pitch.accidental.name == "flat":
                accidental = "b"
            elif n.pitch.accidental.name == "sharp":
                accidental = "#"
            elif n.pitch.accidental.name == "natural":
                accidental = "n"
            else:
                accidental = "none"
        else:
            accidental = "none"
        
        dotted = "dotted" if n.duration.dots > 0 else "none"
        
        return accidental, dotted

    # Función para convertir el formato de la nota
    def format_note_for_vexflow(self, note_name):
        # Eliminar sostenidos y bemoles
        if '#' in note_name or '-' in note_name:
            note_name = note_name[0] + note_name[-1]
        return note_name[0] + '/' + note_name[-1]

    # Función que se encarga de obtener tanto las notas transpuestas como las notas normales
    def get_notes(self, intervalo_transposicion="M2"):
        # Cargar el archivo MusicXML
        score = converter.parse(self.archivo.path)

        # Obtener la firma de tiempo (time signature)
        time_signatures = score.parts[0].getTimeSignatures()
        if time_signatures:
            time_signature = time_signatures[0]
            # Guardar como numerador/denominador
            self.time_signature = f"{time_signature.numerator}/{time_signature.denominator}"

        # Obtener la firma tonal (key signature)
        key_signature = score.analyze('key')
        if key_signature:
            # Guardar la tonalidad con el nombre musical (mayor/menor)
            self.key_signature = f"{key_signature.tonic.name} {key_signature.mode}"

        # Obtener la clave (clef)
        clefs = score.recurse().getElementsByClass('Clef')
        if clefs:
            self.clef = clefs[0].name  # Mostrar solo el nombre de la clave

        # Proceso de transposición
        intervalo = interval.Interval(intervalo_transposicion)
        transposed_score = score.transpose(intervalo)

        # Extraer las notas normales (incluyendo silencios)
        notas_normales = []
        for element in score.recurse():
            if isinstance(element, note.Note):
                accidental, dotted = self.get_note_attributes(element)
                tie_type = element.tie.type if element.tie else 'none'
                notas_normales.append({
                    'nota': self.format_note_for_vexflow(element.nameWithOctave),
                    'duracion': self.duration_to_vexflow(element.quarterLength),
                    'accidental': accidental,
                    'dotted': dotted,
                    'ligadura': tie_type
                })
            elif isinstance(element, note.Rest):
                notas_normales.append({
                    'nota': 'F/3',
                    'duracion': self.duration_to_vexflow(element.quarterLength, is_rest=True),
                    'accidental': 'none',
                    'dotted': 'none',
                    'ligadura': 'none'
                })

        # Extraer las notas transpuestas (incluyendo silencios)
        notas_transpuestas = []
        for element in transposed_score.recurse():
            if isinstance(element, note.Note):
                accidental, dotted = self.get_note_attributes(element)
                tie_type = element.tie.type if element.tie else 'none'
                notas_transpuestas.append({
                    'nota': self.format_note_for_vexflow(element.nameWithOctave),
                    'duracion': self.duration_to_vexflow(element.quarterLength),
                    'accidental': accidental,
                    'dotted': dotted,
                    'ligadura': tie_type
                })
            elif isinstance(element, note.Rest):
                notas_transpuestas.append({
                    'nota': 'F/3',
                    'duracion': self.duration_to_vexflow(element.quarterLength, is_rest=True),
                    'accidental': 'none',
                    'dotted': 'none',
                    'ligadura': 'none'
                })

        # Guardar las notas y la metadata en los campos JSON
        self.notas_transpuestas = notas_transpuestas
        self.notas_normales = notas_normales
        self.save()

        # Aquí se analiza la tonalidad de la partitura
        key = score.analyze('key')
        print(f"La llave: {key}")

    def serialize(self):
        return {
            'titulo': self.titulo,
            'autor': self.autor,
            'descripcion': self.descripcion,
            'time_signature': self.time_signature,
            'key_signature': self.key_signature,
            'clef': self.clef,
            'notas_transpuestas': self.notas_transpuestas,
            'notas_normales': self.notas_normales,
            'usuario': self.user
        }

    def __str__(self):
        return self.titulo
    
   