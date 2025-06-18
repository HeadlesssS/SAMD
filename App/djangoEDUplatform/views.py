from django.http import HttpResponse
from django.shortcuts import render,redirect
from django.core.mail import send_mail
from django.contrib.auth.models import User
from .models import Paymentplans, UserProfile,Teacher,Transaction,Course,Enrollment
from django.contrib.auth import login,authenticate,logout
from django_esewa import EsewaPayment
import uuid
import hmac
import hashlib
import base64
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
import requests
from urllib.parse import urlparse
import os
import json


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
        signature = generate_signature(
            total_amount=selected_plan.price,
            transaction_uuid=auuid,
            key="8gBm/:&EnhH.1/q",  # Use your actual secret key
            product_code="EPAYTEST"
        )

        epayment = EsewaPayment(
            success_url="http://localhost:8000/success/",
            failure_url="http://localhost:8000/failure/",
            secret_key="8gBm/:&EnhH.1/q",
            product_code="EPAYTEST",
            amount=selected_plan.price,
            total_amount=selected_plan.price,
            transaction_uuid=auuid
            # Remove the signature parameter
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
def student(request):
    if request.user.is_authenticated:
        try:
            # Get the userprofile
            profile = request.user.userprofile
            if profile.role.lower() == "student":
                # Get all courses
                courses = Course.objects.all()
                
                # Get user's plan
                try:
                    enrollment = Enrollment.objects.filter(user=request.user, is_active=True).latest('start_date')
                    user_plan = enrollment.plan.plan_type
                except:
                    user_plan = 'free'  # Default to free plan if no active enrollment
                
                # Convert courses to JSON for JavaScript
                courses_data = []
                for course in courses:
                    courses_data.append({
                        'id': course.id,
                        'title': course.title,
                        'description': course.description,
                        'category': course.category,
                        'requiredPlan': course.requiredPlan,
                        'contentType': course.contentType,
                        'contentUrl': request.build_absolute_uri(course.contentFile.url) if course.contentFile else '',
                        'teacherId': course.teacher.id,
                        'enrolledStudents': course.enrolledStudents
                    })
                
                return render(request, "djangoEDUplatform/student.html", {
                    'courses_json': json.dumps(courses_data),
                    'user_plan': user_plan,
                    'user_name': request.user.get_full_name() or request.user.username
                })
        except UserProfile.DoesNotExist:
            pass
    return redirect('login')  # or some error page

def teacher(request):
    if request.user.is_authenticated:
        print("if loop ma aayo")
        try:
            user_profile = request.user.userprofile
            if user_profile.role.lower() == "teacher":
                try:
                    # Get teacher object
                    teacher_obj = Teacher.objects.get(profile=user_profile)
                    
                    # Get all courses created by this teacher
                    teacher_courses = Course.objects.filter(teacher=teacher_obj)
                    
                    # Calculate total earnings
                    total_earnings = 0
                    courses_with_earnings = []
                    
                    for course in teacher_courses:
                        # Calculate course earnings based on enrolled students and plan price
                        course_earnings = 0
                        if course.requiredPlan == 'standard':
                            course_earnings = course.enrolledStudents * 29 * 0.01  # 1% commission
                        elif course.requiredPlan == 'premium':
                            course_earnings = course.enrolledStudents * 59 * 0.01  # 1% commission
                        
                        total_earnings += course_earnings
                        
                        # Add course with pre-calculated earnings
                        courses_with_earnings.append({
                            'course': course,
                            'earnings': course_earnings
                        })
                    
                    # Calculate monthly earnings (30% of total)
                    monthly_earnings = total_earnings * 0.3
                    total_students = sum(course.enrolledStudents for course in teacher_courses)
                    
                    return render(request, "djangoEDUplatform/teacher.html", {
                        'teacher_courses': courses_with_earnings,
                        'teacher_name': request.user.get_full_name() or request.user.username,
                        'total_earnings': total_earnings,
                        'monthly_earnings': monthly_earnings,
                        'total_students': total_students,
                        'total_courses': teacher_courses.count(),
                        'success': request.GET.get('success', None)
                    })
                except Teacher.DoesNotExist:
                    # Create a teacher object if it doesn't exist
                    teacher_obj = Teacher.objects.create(profile=user_profile)
                    return render(request, "djangoEDUplatform/teacher.html", {
                        'teacher_courses': [],
                        'teacher_name': request.user.get_full_name() or request.user.username,
                        'total_earnings': 0,
                        'monthly_earnings': 0,
                        'total_students': 0,
                        'total_courses': 0
                    })
        except UserProfile.DoesNotExist:
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

@login_required
def upload_course(request):
    if request.method == "POST":
        try:
            user_profile = request.user.userprofile
            teacher = Teacher.objects.get(profile=user_profile)
            
            title = request.POST.get('title')
            description = request.POST.get('description')
            category = request.POST.get('category')
            required_plan = request.POST.get('required_plan')
            content_type = request.POST.get('content_type')
            
            course = Course(
                title=title,
                description=description,
                category=category,
                requiredPlan=required_plan,
                contentType=content_type,
                teacher=teacher,
                enrolledStudents=0
            )
            
            if content_type == 'pdf':
                if 'content_file' in request.FILES:
                    course.contentFile = request.FILES['content_file']
                else:
                    return redirect('teacher')
            elif content_type == 'video':
                video_url = request.POST.get('video_url')
                if video_url:
                    filename = f"video_link_{title.replace(' ', '_')}.txt"
                    content = ContentFile(video_url.encode('utf-8'))
                    course.contentFile.save(filename, content, save=False)
                else:
                    return redirect('teacher')
            
            course.save()
            
            # Redirect back to teacher dashboard with success message
            return redirect('teacher')
            
        except (UserProfile.DoesNotExist, Teacher.DoesNotExist):
            return redirect('login')
        except Exception as e:
            return redirect('teacher')
    
    return redirect('teacher')
