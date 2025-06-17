from django.http import HttpResponse
from django.shortcuts import render,redirect
from django.core.mail import send_mail
from django.contrib.auth.models import User
from .models import Paymentplans, UserProfile,Teacher,Transaction
from django.contrib.auth import login,authenticate,logout
from django_esewa import EsewaPayment
import uuid
import hmac
import hashlib
import base64


def generate_signature(key, message):
    key = key.encode('utf-8')
    message = message.encode('utf-8')
    hmac_sha256 = hmac.new(key, message, hashlib.sha256)
    digest = hmac_sha256.digest()
    signature = base64.b64encode(digest).decode('utf-8')
    return signature


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
    role = request.session.get('role', 'student')
    payment_plans = Paymentplans.objects.all()

    if request.method == "POST":
        plan_id = request.POST.get('plan_id')
        if not plan_id:
            return render(request, "djangoEDUplatform/payment.html", {
                "role": role,
                "payment_plans": payment_plans,
                "error": "Please select a plan."
            })
        try:
            selected_plan = Paymentplans.objects.get(id=plan_id)
        except Paymentplans.DoesNotExist:
            return render(request, "djangoEDUplatform/payment.html", {
                "role": role,
                "payment_plans": payment_plans,
                "error": "Selected plan does not exist."
            })

        auuid = str(uuid.uuid4())
        transaction = Transaction.objects.create(
            transaction_uuid=auuid,
            Plan=selected_plan,
            user=request.user,
            amount=selected_plan.price,
            status='pending'
        )

        # Build the message as per Esewa's requirement
        message = f'total_amount={selected_plan.price},transaction_uuid={auuid},product_code=EPAYTEST'
        secret_key = "8gBm/:&EnhH.1/q"  # Use your actual secret key

        signature = generate_signature(secret_key, message)

        epayment = EsewaPayment(
            success_url="http://localhost:8000/success/",
            failure_url="http://localhost:8000/failure/",
            secret_key="8gBm/:&EnhH.1/q",
            product_code="EPAYTEST",
            amount=selected_plan.price,
            total_amount=selected_plan.price,
            transaction_uuid=auuid,
            signature=signature  # Pass the generated signature
        )

        # No need to call epayment.create_signature() since you already generated it

        return render(request, "djangoEDUplatform/payment.html", {
            "role": role,
            "payment_plans": payment_plans,
            "form": epayment.generate_form(),
            "selected_plan": selected_plan
        })

    # GET request
    return render(request, "djangoEDUplatform/payment.html", {
        "role": role,
        "payment_plans": payment_plans
    })
sdfdfssdsdf
def student(request):
    print("if loop ma aayo")
    if request.user.is_authenticated:
        try:
            # Try to get the userprofile
            profile = request.user.userprofile
            if profile.role.lower() == "student":
                print("vitra")
                return render(request, "djangoEDUplatform/student.html")
        except UserProfile.DoesNotExist:
            print("UserProfile does not exist")
            pass
    return redirect('login')  # or some error page

def teacher(request):
    if request.user.is_authenticated:
        print("if loop ma aayo")
        try:
            user_profile = request.user.userprofile
            teacher_obj = Teacher.objects.get(profile=user_profile)
            if user_profile.role.lower() == "teacher":
                print("vitra")
                return render(request, "djangoEDUplatform/teacher.html")
        except (UserProfile.DoesNotExist, Teacher.DoesNotExist):
            print('UserProfile or Teacher does not exist')
            pass
    return redirect('login')


def login_view(request):
    error = None
    if request.method == "POST":
        name=request.POST.get("name")
        password=request.POST.get("pw")

        if name and password:
            user=authenticate(request,username=name,password=password)

            if user is not None:
                login(request, user)
                print("login vayo")
                try:
                    role = user.userprofile.role
                    print("role:", role)
                    if role == "student":
                        return redirect('student')
                    elif role == "teacher":
                        return redirect('teacher')
                except UserProfile.DoesNotExist:
                    print("attribute nai xaina")
                    error = "Profile not found. Please contact support."
            else:
                error = "Invalid credentials"
    return render(request, "djangoEDUplatform/login.html", {"error": error})

def signup(request):
    error = None
    if request.method == "POST":
        full_name = request.POST.get("fullName")
        email = request.POST.get("email")
        password = request.POST.get("password")
        role = request.POST.get("userType")
        phone_number = request.POST.get("phone_number")
        esewa_id = request.POST.get("esewa_id")

        if not all([full_name, email, password, role, phone_number, esewa_id]):
            error = "All fields are required."
        elif User.objects.filter(username=full_name).exists():
            error = "Username exists"
        elif User.objects.filter(email=email).exists():
            error = "Email already exists"
        else:
            try:
                user = User.objects.create_user(username=full_name, email=email, password=password)
                print("user ma aayo")
                user_profile = UserProfile.objects.create(
                    user=user,
                    full_name=full_name,
                    phone_number=phone_number,
                    esewa_id=esewa_id,
                    role=role
                )
                if role == 'teacher':
                    print("teacher ma ayo")
                    Teacher.objects.create(profile=user_profile)
                    return redirect('login')
                
                print("redirect samma ta airaxaq ta")

                return redirect('login')
                
            except Exception as e:
                print("Exception",e)
                error = f"Error: {e}"

    return render(request, "djangoEDUplatform/signup.html", {"error": error})

def success(request):
    return render(request,'djangoEDUplatform/success.html')

def failure(request):
    return render(request,'djangoEDUplatform/failure.html')

def logout_view(request):
    logout(request)
    return redirect('home')
