"""
Models for the services app.
"""
from django.db import models
from django.utils.text import slugify


class Service(models.Model):
    """
    Model for services offered by TechLedger Solutions.
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField()
    icon_class = models.CharField(
        max_length=50,
        blank=True,
        help_text='CSS class name for service icon'
    )
    display_order = models.IntegerField(
        default=0,
        help_text='Order in which services are displayed (lower numbers first)'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Whether this service is currently active and displayed'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
