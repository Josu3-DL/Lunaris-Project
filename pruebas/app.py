from music21 import converter, note

# Cargar el archivo MusicXML
score = converter.parse('Klishmannb_practice_3.mxl')


# Transponer el score
interval = 'M2'  # Intervalo de transposición, por ejemplo, una segunda mayor
transposed_score = score.transpose(interval)

# Función para convertir la duración a formato de letras de VexFlow
def duration_to_vexflow(duration):
    if duration == 4.0:
        return "w"
    elif duration == 2.0:
        return "h"
    elif duration == 1.0:
        return "q"
    elif duration == 0.5:
        return "8"
    elif duration == 0.25:
        return "16"
    elif duration == 0.125:
        return "32"
    elif duration == 3.0:
        return "h"  # Blanca con puntillo
    elif duration == 0.0:
        return "r"
    else:
        return f"duración desconocida ({duration})"

# Función para determinar el accidental y si la nota está punteada
def get_note_attributes(n):
    accidental = ""
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
def format_note_for_vexflow(note_name):
    # Eliminar sostenidos y bemoles
    if '#' in note_name or '-' in note_name:
        note_name = note_name[0] + note_name[-1]
    return note_name[0] + '/' + note_name[-1]

# Extraer las notas de todas las páginas
notes = [element for element in score.recurse() if isinstance(element, note.Note)]
transposed_notes = [element for element in transposed_score.recurse() if isinstance(element, note.Note)]

# Imprimir las notas originales
for n in notes:
    accidental, dotted = get_note_attributes(n)
    formatted_note = format_note_for_vexflow(n.nameWithOctave)
    print(f'Nota: {formatted_note}, Duración: {duration_to_vexflow(n.quarterLength)}, Accidental: {accidental}, Puntillo: {dotted}')

# Imprimir las notas transpuestas
for n in transposed_notes:
    accidental, dotted = get_note_attributes(n)
    formatted_note = format_note_for_vexflow(n.nameWithOctave)
    print(f'Nota transpuesta: {formatted_note}, Duración: {duration_to_vexflow(n.quarterLength)}, Accidental: {accidental}, Puntillo: {dotted}')

# Analizar y imprimir la tonalidad
key = score.analyze('key')
print(key)
