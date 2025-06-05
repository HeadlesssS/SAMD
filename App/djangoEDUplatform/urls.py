from django.contrib import admin
from django.urls import path
from .views import blogpage,homepage,payment,student,teacher,login,signup

urlpatterns = [
    path('',homepage,name="home"),
    path('blog/',blogpage,name="blog"),
    path("payment/",payment,name="payment"),
    path("student/",student,name="student"),
    path("teacher/",teacher,name="teacher"),
    path("login/",login,name="login"),
    path("signup/",signup,name="signup")
]