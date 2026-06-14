"""
Forms for the contact app.
"""
from django import forms
from .models import ContactInquiry


class ContactForm(forms.ModelForm):
    """
    Form for contact inquiries.
    """
    # Service choices for subject dropdown
    SERVICE_CHOICES = [
        ('', 'Select a Service'),
        ('web-development', 'Web Development'),
        ('application-development', 'Application Development'),
        ('research-analytics', 'Research & Analytics'),
        ('financial-management', 'Financial Management'),
        ('technology-solutions', 'Technology Solutions'),
        ('consulting-services', 'Consulting Services'),
        ('custom-development', 'Custom Development'),
        ('system-integration', 'System Integration'),
        ('other', 'Other'),
    ]
    
    # Override subject field to use ChoiceField with dropdown
    subject = forms.ChoiceField(
        choices=SERVICE_CHOICES,
        required=True,
        widget=forms.Select(attrs={
            'class': 'form-control',
        })
    )

    class Meta:
        model = ContactInquiry
        fields = ['name', 'email', 'phone', 'subject', 'topic', 'message']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Your Name',
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'your.email@example.com',
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Phone Number (Optional)',
            }),
            'topic': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Subject',
            }),
            'message': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Your Message',
                'rows': 5,
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Phone is optional; subject line (topic) is required to match the design
        self.fields['phone'].required = False
        self.fields['topic'].required = True

    def clean_name(self):
        """Validate name field."""
        name = self.cleaned_data.get('name')
        if name and len(name.strip()) < 2:
            raise forms.ValidationError('Name must be at least 2 characters long.')
        return name.strip()

    def clean_message(self):
        """Validate message field."""
        message = self.cleaned_data.get('message')
        if message and len(message.strip()) < 10:
            raise forms.ValidationError('Message must be at least 10 characters long.')
        return message.strip()

