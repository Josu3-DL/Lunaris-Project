# Generated by Django 5.1.2 on 2024-10-25 14:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Core', '0002_partitura_clef_partitura_key_signature_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partitura',
            name='key_signature',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]