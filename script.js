// Dual Integration: Google Sheets + Mailchimp for Coexistence Mall waitlist
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');

    form.addEventListener('submit', function(e) {
        // Don't prevent default - let the form submit to Google Sheets
        console.log('Form submitting to Google Sheets...');
        
        // Get form data for Mailchimp
        const formData = {
            email: document.getElementById('email').value,
            fullName: document.getElementById('fullName').value,
            businessName: document.getElementById('businessName').value,
            userType: document.getElementById('userType').value
        };
        
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
        
        // Also submit to Mailchimp (dual integration)
        submitToMailchimp(formData);
        
        // Reset button and show success after delay
        setTimeout(() => {
            showSuccessMessage();
            form.reset();
            button.innerHTML = originalText;
            button.disabled = false;
        }, 3000);
    });

    function submitToMailchimp(data) {
        try {
            // Split name into first and last
            const nameParts = data.fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Fill hidden Mailchimp form
            document.getElementById('mce-EMAIL').value = data.email;
            document.getElementById('mce-FNAME').value = firstName;
            document.getElementById('mce-LNAME').value = lastName;
            document.getElementById('mce-MMERGE3').value = data.businessName || '';
            document.getElementById('mce-MMERGE4').value = data.userType || '';
            
            // Submit Mailchimp form in background
            document.getElementById('mc-embedded-subscribe').click();
            
            console.log('✅ Also submitted to Mailchimp');
        } catch (error) {
            console.log('⚠️ Mailchimp submission failed, but Google Sheets still working:', error);
        }
    }

    function showSuccessMessage() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 32px;
            border-radius: 16px;
            text-align: center;
            margin: 32px 0;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(16, 185, 129, 0.2);
        `;
        successDiv.innerHTML = `
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h3 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold;">🎉 Welcome to the Future!</h3>
            <p style="margin: 0 0 16px 0; font-size: 18px; opacity: 0.9;">You're now on the Coexistence waitlist and will be notified as soon as early access is available.</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Check your email for confirmation and exclusive updates!</p>
        `;
        
        // Insert after the form
        const formSection = document.getElementById('waitlist');
        formSection.appendChild(successDiv);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove success message after 8 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 8000);
    }

    // Function to download all signups (for you) - keeping for backup
    window.exportSignups = function() {
        const signups = JSON.parse(localStorage.getItem('waitlistSignups') || '[]');
        
        if (signups.length === 0) {
            alert('No signups yet!');
            return;
        }
        
        // Convert to CSV
        const headers = ['Email', 'Name', 'Business', 'Role', 'Timestamp'];
        const csv = [
            headers.join(','),
            ...signups.map(s => [
                s.email,
                `"${s.name}"`,
                `"${s.business}"`,
                s.role,
                `"${s.timestamp}"`
            ].join(','))
        ].join('\n');
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'coexistence-signups.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        console.log('📊 Downloaded', signups.length, 'signups!');
    };
});
