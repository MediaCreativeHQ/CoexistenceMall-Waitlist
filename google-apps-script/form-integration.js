/**
 * Updated JavaScript code for your index.html form
 * Replace the existing form submission script with this code
 */

// Configuration - UPDATE THIS WITH YOUR ACTUAL WEB APP URL
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE'; // Get this from Apps Script deployment

// Enhanced form handling with Google Sheets integration
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                email: document.getElementById('email').value.trim(),
                fullName: document.getElementById('fullName').value.trim(),
                userType: document.getElementById('userType').value,
                businessName: document.getElementById('businessName').value.trim(),
                businessEmail: '' // Add this field if you want business email collection
            };
            
            // Validate required fields
            if (!formData.email || !formData.fullName || !formData.userType) {
                showErrorMessage(form, 'Please fill in all required fields.');
                return;
            }
            
            // Validate email format
            if (!isValidEmail(formData.email)) {
                showErrorMessage(form, 'Please enter a valid email address.');
                return;
            }
            
            console.log('Submitting form data:', formData);
            
            // Show loading state
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            
            button.innerHTML = `
                <div class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining Waitlist...
                </div>
            `;
            button.disabled = true;
            
            // Submit to Google Apps Script
            submitToGoogleSheets(formData, form, button, originalText);
        });
    }
});

/**
 * Submit form data to Google Sheets via Apps Script
 */
function submitToGoogleSheets(formData, form, button, originalText) {
    // Check if Google Apps Script URL is configured
    if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_WEB_APP_URL_HERE') {
        console.error('Google Apps Script URL not configured');
        showLocalDemo(formData, form);
        return;
    }
    
    fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Google Sheets response:', data);
        
        if (data.success) {
            // Show success message
            showSuccessMessage(form, data.emailSent);
            
            // Optional: Track successful submission
            trackConversion('waitlist_signup', formData);
            
        } else {
            throw new Error(data.error || 'Submission failed');
        }
    })
    .catch(error => {
        console.error('Submission error:', error);
        
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Show user-friendly error message
        let errorMessage = 'Sorry, there was an error processing your submission. Please try again.';
        
        if (error.message.includes('duplicate')) {
            errorMessage = 'This email is already on our waitlist. Thank you for your interest!';
        } else if (error.message.includes('invalid email')) {
            errorMessage = 'Please enter a valid email address.';
        }
        
        showErrorMessage(form, errorMessage);
        
        // Optional: Track failed submission for analytics
        trackError('form_submission_failed', error.message);
    });
}

/**
 * Show local demo when Google Apps Script isn't configured
 */
function showLocalDemo(formData, form) {
    console.log('Running in demo mode - data not saved to Google Sheets');
    console.log('Form data:', formData);
    
    // Store locally for demo purposes
    const existingData = JSON.parse(localStorage.getItem('coexistence_waitlist') || '[]');
    existingData.push({
        ...formData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('coexistence_waitlist', JSON.stringify(existingData));
    
    // Show demo success message
    setTimeout(() => {
        showSuccessMessage(form, false, true);
    }, 1500);
}

/**
 * Show success message after form submission
 */
function showSuccessMessage(form, emailSent = false, isDemo = false) {
    const emailStatusText = emailSent ? 
        'Check your email for a welcome message and next steps!' : 
        'You\'ll receive a confirmation email shortly.';
    
    const demoText = isDemo ? 
        '<p class="text-sm text-yellow-400 mt-2">⚠️ Demo Mode: Configure Google Apps Script URL for full functionality</p>' : '';
    
    form.innerHTML = `
        <div class="text-center py-8">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Welcome to the Future! 🚀</h3>
            <p class="text-gray-300 mb-4">
                You're now on the Coexistence Mall waitlist. We'll notify you as soon as early access is available.
            </p>
            <p class="text-sm text-gray-400">
                ${emailStatusText}
            </p>
            ${demoText}
        </div>
    `;
    
    // Optional: Show confetti animation
    triggerConfetti();
}

/**
 * Show error message
 */
function showErrorMessage(form, message) {
    // Remove any existing error messages
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-red-400 text-sm';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    // Add error message to top of form
    form.insertBefore(errorDiv, form.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
    
    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Optional: Track successful conversions
 */
function trackConversion(eventName, data) {
    // Add your analytics tracking here
    // Examples: Google Analytics, Facebook Pixel, etc.
    
    console.log('Conversion tracked:', eventName, data);
    
    // Google Analytics 4 example:
    // gtag('event', eventName, {
    //     'custom_parameter': data.userType
    // });
    
    // Facebook Pixel example:
    // fbq('track', 'Lead', {
    //     content_name: 'Waitlist Signup',
    //     content_category: data.userType
    // });
}

/**
 * Optional: Track errors for debugging
 */
function trackError(errorType, errorMessage) {
    console.error('Error tracked:', errorType, errorMessage);
    
    // Add error tracking here
    // Examples: Sentry, LogRocket, etc.
}

/**
 * Optional: Confetti animation for success
 */
function triggerConfetti() {
    // Simple confetti effect (requires canvas-confetti library)
    // Add this to your HTML head: <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

/**
 * Export function to download waitlist data (for demo mode)
 */
window.exportWaitlistData = function() {
    const data = JSON.parse(localStorage.getItem('coexistence_waitlist') || '[]');
    
    if (data.length === 0) {
        alert('No waitlist data found.');
        return;
    }
    
    // Convert to CSV
    const headers = ['Timestamp', 'Email', 'Full Name', 'Interest', 'Business Name'];
    const csv = [
        headers.join(','),
        ...data.map(entry => [
            `"${entry.timestamp}"`,
            `"${entry.email}"`,
            `"${entry.fullName}"`,
            `"${entry.userType}"`,
            `"${entry.businessName}"`
        ].join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coexistence-waitlist.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('Downloaded waitlist data:', data.length, 'entries');
};