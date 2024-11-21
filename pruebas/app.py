from music21 import converter, note, chord
from music21.note import Rest

# Cargar el archivo MusicXML
score = converter.parse('Klishmannb_practice_3.mxl')

# Transponer el score
interval = 'M2'  # Intervalo de transposición, por ejemplo, una segunda mayor
transposed_score = score.transpose(interval)

# Función para convertir la duración a formato de letras de VexFlow
def duration_to_vexflow(duration, is_rest=False):
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
        return "r"
    else:
        return f"duración desconocida ({duration})"

# Función para determinar el accidental y si la nota está punteada
def get_note_attributes(n):
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
notes = [element for element in score.recurse() if isinstance(element, (note.Note, Rest))]
transposed_notes = [element for element in transposed_score.recurse() if isinstance(element, (note.Note, Rest))]

# Imprimir las notas originales
for n in notes:
    if isinstance(n, note.Note):
        accidental, dotted = get_note_attributes(n)
        formatted_note = format_note_for_vexflow(n.nameWithOctave)
        tie_type = n.tie.type if n.tie else 'none'
        print(f'Nota: {formatted_note}, Duración: {duration_to_vexflow(n.quarterLength)}, Accidental: {accidental}, Puntillo: {dotted}, Ligadura: {tie_type}')
    elif isinstance(n, Rest):
        print(f'Silencio: r, Duración: {duration_to_vexflow(n.quarterLength, is_rest=True)}, Accidental: none, Puntillo: none, Ligadura: none')

# Imprimir las notas transpuestas
for n in transposed_notes:
    if isinstance(n, note.Note):
        accidental, dotted = get_note_attributes(n)
        formatted_note = format_note_for_vexflow(n.nameWithOctave)
        tie_type = n.tie.type if n.tie else 'none'
        print(f'Nota transpuesta: {formatted_note}, Duración: {duration_to_vexflow(n.quarterLength)}, Accidental: {accidental}, Puntillo: {dotted}, Ligadura: {tie_type}')
    elif isinstance(n, Rest):
        print(f'Silencio transpuesto: r, Duración: {duration_to_vexflow(n.quarterLength, is_rest=True)}, Accidental: none, Puntillo: none, Ligadura: none')

# Analizar y imprimir la tonalidad
key = score.analyze('key')
print(key)
