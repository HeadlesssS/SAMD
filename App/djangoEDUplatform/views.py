from django.shortcuts import render
from django.core.mail import send_mail

def blogpage(request):
    return render(request,"djangoEDUplatform/own.html")

def homepage(request):
    return render(request,"djangoEDUplatform/index.html")

def payment(request):
    return render(request, "djangoEDUplatform/payment.html")

def student(request):
    return render(request,"djangoEDUplatform/student.html")

def teacher(request):
    return render(request, "djangoEDUplatform/teacher.html")

def login(request):
    return render(request,"djangoEDUplatform/login.html")

def signup(request):
    return render(request,"djangoEDUplatform/signup.html")