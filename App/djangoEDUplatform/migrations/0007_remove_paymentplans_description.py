# Generated by Django 5.2.1 on 2025-06-17 04:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('djangoEDUplatform', '0006_remove_paymentplans_plan_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='paymentplans',
            name='description',
        ),
    ]
