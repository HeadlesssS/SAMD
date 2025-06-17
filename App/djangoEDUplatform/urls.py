from django.contrib import admin
from django.urls import path
from .views import blogpage,homepage,payment,student,teacher,login_view,signup,success,failure,logout_view

urlpatterns = [
    path('',homepage,name="home"),
    path('blog/',blogpage,name="blog"),
    path("payment/",payment,name="payment"),
    path("student/",student,name="student"),
    path("teacher/",teacher,name="teacher"),
    path("login/",login_view,name="login"),
    path("signup/",signup,name="signup"),
    path("success/",success,name="success"),
    path("failure/",failure,name="failure"),
    path('logout/', logout_view, name='logout'),
]
