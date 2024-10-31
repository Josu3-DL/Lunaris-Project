# Generated by Django 5.1.2 on 2024-10-31 18:57

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Partitura',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=100)),
                ('autor', models.CharField(blank=True, max_length=100, null=True)),
                ('descripcion', models.TextField(blank=True, null=True)),
                ('archivo', models.FileField(upload_to='partituras/')),
                ('notas_transpuestas', models.JSONField(blank=True, null=True)),
                ('notas_normales', models.JSONField(blank=True, null=True)),
                ('time_signature', models.CharField(blank=True, max_length=10, null=True)),
                ('key_signature', models.CharField(blank=True, max_length=20, null=True)),
                ('clef', models.CharField(blank=True, max_length=10, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
