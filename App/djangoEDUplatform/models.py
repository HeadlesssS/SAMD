from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver

class UserProfile(models.Model):
    ROLE_CHOICES=[
        ('student','Student','STUDENT'),
        ('teacher','Teacher','TEACHER'),
    ]

    user =models.OneToOneField(User,on_delete=models.CASCADE)
    full_name=models.CharField(max_length=100)
    phone_number=models.CharField(max_length=10)
    esewa_id=models.IntegerField(max_length=10)
    role=models.CharField(max_length=10,choices=ROLE_CHOICES)


    def __str__(self):
        return f"{self.user.username}-{self.role}"



class Teacher(models.Model):
    profile=models.OneToOneField(UserProfile,on_delete= models.CASCADE)
    earning=models.IntegerField(default=0)

@receiver(post_save,sender=User)
def create_user_profile(sender,instance,created,**kwargs):
    if created:
        UserProfile.objects.create(user=instance)