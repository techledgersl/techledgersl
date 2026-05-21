/**
 * Contact Form JavaScript - Form validation and enhanced user experience
 */

const ContactForm = (function() {
    'use strict';

    let contactForm;
    let formInputs;

    /**
     * Initialize contact form functionality
     */
    function init() {
        contactForm = document.querySelector('.contact-form');
        
        if (!contactForm) return;

        formInputs = contactForm.querySelectorAll('input, textarea');
        
        // Add real-time validation
        formInputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });

        // Enhance form submission
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    /**
     * Validate individual field
     */
    function validateField(event) {
        const field = event.target;
        const fieldName = field.name;
        const fieldValue = field.value.trim();

        // Remove existing error
        clearFieldError(event);

        // Validate based on field name
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'name':
                if (fieldValue.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long.';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(fieldValue)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
            case 'subject':
                if (fieldValue.length < 3) {
                    isValid = false;
                    errorMessage = 'Subject must be at least 3 characters long.';
                }
                break;
            case 'message':
                if (fieldValue.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters long.';
                }
                break;
        }

        if (!isValid) {
            showFieldError(field, errorMessage);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    function showFieldError(field, message) {
        field.classList.add('error');
        
        // Create or update error element
        let errorElement = field.parentElement.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            field.parentElement.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    /**
     * Clear field error
     */
    function clearFieldError(event) {
        const field = event.target;
        field.classList.remove('error');
        
        const errorElement = field.parentElement.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Handle form submission
     */
    function handleFormSubmit(event) {
        let isFormValid = true;

        // Validate all fields
        formInputs.forEach(input => {
            const fieldEvent = new Event('blur');
            input.dispatchEvent(fieldEvent);
            
            if (input.classList.contains('error')) {
                isFormValid = false;
            }
        });

        // If form is invalid, prevent submission
        if (!isFormValid) {
            event.preventDefault();
            
            // Scroll to first error
            const firstError = contactForm.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        } else {
            // Form is valid, allow submission
            // Could add loading state here if needed
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }
        }
    }

    // Public API
    return {
        init: init
    };

})();

