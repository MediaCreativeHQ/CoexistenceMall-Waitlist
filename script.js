// Simple form handling - stores data in browser
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const signupData = {
            email: document.getElementById('email').value,
            name: document.getElementById('name').value,
            business: document.getElementById('business').value,
            role: document.getElementById('role').value,
            timestamp: new Date().toLocaleString()
        };

        // Save to browser storage
        saveSignup(signupData);
        
        // Show success message
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Reset form
        form.reset();
    });

    function saveSignup(data) {
        // Get existing signups
        const existing = JSON.parse(localStorage.getItem('waitlistSignups') || '[]');
        
        // Add new one
        existing.push(data);
        
        // Save back
        localStorage.setItem('waitlistSignups', JSON.stringify(existing));
        
        console.log('✅ Signup saved! Total:', existing.length);
    }

    // Function to download all signups (for you)
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
