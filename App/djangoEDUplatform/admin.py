from django.contrib import admin

from .models import Paymentplans

class PaymentplansAdmin(admin.ModelAdmin):
    list_display = ('name',  'price', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)
    fieldsets=(
        (None,{'fields':('name','price','features','is_active')}),
    )


admin.site.register(Paymentplans,PaymentplansAdmin)
