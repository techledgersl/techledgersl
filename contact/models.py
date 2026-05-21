"""
Models for the contact app.
"""
from django.db import models
from django.utils import timezone


class ContactInquiry(models.Model):
    """
    Model for storing contact form inquiries.
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )

    class Meta:
        verbose_name = 'Contact Inquiry'
        verbose_name_plural = 'Contact Inquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"
