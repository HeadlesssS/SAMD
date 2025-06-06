from django.http import HttpResponse
from django.shortcuts import render
from django.core.mail import send_mail

def blogpage(request):
    return render(request,"djangoEDUplatform/own.html")

def homepage(request):
    success=False
    if request.method=="POST":

        name=request.POST.get("emailName")
        email=request.POST.get("emailEmail")
        message=request.POST.get("emailMessage")

        if name and email and message:
            try:
                    
                send_mail(
                    subject=f"Message by{name}",
                    message=message,
                    from_email=email,
                    recipient_list=[email]
                )
                success=True
            except Exception as e:
                return HttpResponse(f"error:{e}")
            
    return render(request,"djangoEDUplatform/index.html",{"success": success})


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

