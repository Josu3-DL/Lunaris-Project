from .models import Partitura
from rest_framework import serializers


class PartituraSerializer(serializers.ModelSerializer):

    class Meta:
        model = Partitura
        fields = [
            'id', 'titulo', 'autor', 'descripcion', 'archivo',
            'time_signature',
            'key_signature', 'clef'
        ]
        read_only_fields = ['notas_transpuestas', 'notas_normales', 'time_signature', 'key_signature', 'clef']
    

    def create(self, validated_data):
        return Partitura.objects.create(**validated_data)