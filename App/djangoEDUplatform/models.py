from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

from django_esewa import EsewaPayment

payment = EsewaPayment(
    product_code="EPAYTEST",
        success_url="http://localhost:8000/success/",
        failure_url="http://localhost:8000/failure/",
        amount=100,
        tax_amount=0,
        total_amount=100,
        product_service_charge=0,
        product_delivery_charge=0,
        transaction_uuid="11-200-111sss1",
)
class UserProfile(models.Model):
    ROLE_CHOICES=[
        ('student','Student'),
        ('teacher','Teacher'),
    ]

    user =models.OneToOneField(User,on_delete=models.CASCADE)
    full_name=models.CharField(max_length=100)
    phone_number=models.CharField(max_length=10)
    esewa_id=models.IntegerField(null=True)
    role=models.CharField(max_length=10,choices=ROLE_CHOICES)


    def __str__(self):
        return f"{self.user.username}-{self.role}"

class Teacher(models.Model):
    profile=models.OneToOneField(UserProfile,on_delete= models.CASCADE)
    earning=models.IntegerField(default=0)

class Paymentplans(models.Model):

    name=models.CharField(max_length=100)
    price=models.DecimalField(max_digits=6,decimal_places=2)
    features=models.TextField(help_text="Enter features separated by newlines")  
    is_active=models.BooleanField(default=True)

class Transaction(models.Model):
    Plan = models.ForeignKey(Paymentplans, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    transaction_uuid = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=100,choices=[('pending','Pending'),('completed','Completed'),('failed','Failed')],default='pending')

