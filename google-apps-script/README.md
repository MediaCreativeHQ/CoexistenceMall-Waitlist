# 📊 Coexistence Mall - Google Apps Script Waitlist Tracker

## 🚀 Complete Setup Instructions

### **Step 1: Create Google Spreadsheet**
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **"Coexistence Mall Waitlist Tracker"**
4. Note the spreadsheet URL for later

### **Step 2: Setup Apps Script Project**
1. In your spreadsheet, go to **Extensions** → **Apps Script**
2. Delete the default `myFunction()` code
3. Copy and paste the entire `Code.gs` content
4. Save the project (Ctrl+S)
5. Name it: **"Coexistence Mall Tracker"**

### **Step 3: Authorize Permissions**
1. Click **Run** → **onOpen** to test
2. Authorize all permissions when prompted:
   - Read/write access to Google Sheets
   - Send emails via Gmail
   - Create time-based triggers

### **Step 4: Initialize the Tracker**
1. Refresh your Google Sheet
2. You should see a new menu: **"🏪 Coexistence Mall"**
3. Click: **Coexistence Mall** → **📊 Setup Waitlist Tracker**
4. This creates the proper column headers and formatting

### **Step 5: Test Email Functionality**
1. Click: **Coexistence Mall** → **🧪 Test Welcome Email**
2. Check your email inbox for the welcome message
3. Verify the email looks correct and professional

### **Step 6: Setup Form Integration**

#### **Option A: Google Forms Integration**
1. Create a Google Form with these fields:
   - Email Address (required)
   - Full Name (required)
   - I'm interested as a (dropdown: Shopper, Vendor, Supplier, Investor)
   - Business Name (optional)
   - Business Email (optional)

2. Link form responses to your spreadsheet:
   - In Google Forms → Responses → Create Spreadsheet
   - Select your existing Coexistence Mall spreadsheet

3. Update the trigger:
   ```javascript
   // Replace the time-based trigger in setupTrigger() with:
   ScriptApp.newTrigger('onFormSubmit')
     .timeBased()
     .onFormSubmit()
     .create();
   ```

#### **Option B: Custom Web Form Integration**
1. Add this webhook endpoint to your HTML form
2. Use Apps Script Web App deployment:
   - Click **Deploy** → **New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Access: **Anyone**
   - Copy the web app URL

3. Add this doPost function to handle form submissions:
   ```javascript
   function doPost(e) {
     try {
       const data = JSON.parse(e.postData.contents);
       const rowData = [
         new Date(),
         data.email,
         data.fullName,
         data.userType,
         data.businessName || '',
         data.businessEmail || ''
       ];
       
       const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
       const newRow = sheet.getLastRow() + 1;
       sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
       
       processSubmission(rowData, newRow);
       
       return ContentService.createTextOutput(JSON.stringify({success: true}))
         .setMimeType(ContentService.MimeType.JSON);
     } catch (error) {
       return ContentService.createTextOutput(JSON.stringify({success: false, error: error.message}))
         .setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```

### **Step 7: Update Your HTML Form**

Update your `index.html` form to submit to Google Sheets:

```javascript
// Replace the form submission code with:
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        fullName: document.getElementById('fullName').value,
        userType: document.getElementById('userType').value,
        businessName: document.getElementById('businessName').value,
        businessEmail: document.getElementById('businessName').value // Optional: add business email field
    };
    
    // Show loading state
    const button = form.querySelector('button[type="submit"]');
    button.innerHTML = 'Processing...';
    button.disabled = true;
    
    // Submit to Google Apps Script
    fetch('YOUR_WEB_APP_URL_HERE', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage(form);
        } else {
            throw new Error(data.error || 'Submission failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Reset button and show error
        button.innerHTML = 'Secure My Spot';
        button.disabled = false;
        alert('Sorry, there was an error. Please try again.');
    });
});
```

## 🎯 **Features Included**

### **✅ Core Functions**
- ✅ `onFormSubmit(e)` - Processes new submissions
- ✅ `processSubmission()` - Validates and handles data
- ✅ `sendWelcomeEmail()` - Sends personalized emails
- ✅ `setupTrigger()` - Installs submission triggers
- ✅ `onOpen()` - Creates custom menu

### **✅ Email Features**
- ✅ Professional HTML email template with Coexistence Mall branding
- ✅ Personalized greetings using first name
- ✅ Interest-specific content (Shopper, Vendor, Supplier, Investor)
- ✅ Both HTML and plain text versions
- ✅ Responsive design for mobile devices

### **✅ Data Management**
- ✅ Automatic duplicate email detection
- ✅ Data validation and error handling
- ✅ Status tracking for each submission
- ✅ Email delivery confirmation

### **✅ Admin Features**
- ✅ Custom menu for easy access
- ✅ Analytics dashboard
- ✅ Manual email sending
- ✅ Test email functionality
- ✅ Error notifications

## 🛠️ **Customization Options**

### **Email Template**
Edit the `generateEmailContent()` function to customize:
- Email subject line
- Company branding
- Call-to-action buttons
- Footer information

### **Form Fields**
Update the `CONFIG.COLUMNS` object to match your form fields:
```javascript
const CONFIG = {
  COLUMNS: {
    TIMESTAMP: 0,
    EMAIL: 1,
    NAME: 2,
    INTEREST: 3,
    BUSINESS_NAME: 4,
    BUSINESS_EMAIL: 5,
    EMAIL_SENT: 6,
    STATUS: 7
  }
};
```

### **Interest-Specific Messages**
Modify `getInterestSpecificMessage()` to add new user types or change messaging.

## 🔍 **Testing & Debugging**

### **Test Checklist**
- [ ] Forms submit correctly to spreadsheet
- [ ] Welcome emails send automatically
- [ ] Duplicate emails are detected
- [ ] Error handling works properly
- [ ] Analytics show correct data

### **Debug Tools**
1. **View Logs**: Apps Script Editor → Execution Transcript
2. **Test Functions**: Use the custom menu items
3. **Check Triggers**: Apps Script Editor → Triggers tab
4. **Email Delivery**: Check Gmail sent folder

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Emails not sending**: Check Gmail quotas (100 emails/day)
2. **Trigger not working**: Verify trigger is properly installed
3. **Form not submitting**: Check web app deployment permissions
4. **Duplicate detection fails**: Verify column mapping

### **Error Notifications**
The script automatically sends error reports to the spreadsheet owner's email when issues occur.

## 📈 **Analytics & Monitoring**

Access analytics via: **Coexistence Mall** → **📈 View Analytics**

Includes:
- Total submissions count
- Welcome emails sent
- Success rate percentage
- Breakdown by interest type
- Last update timestamp

---

**🎉 Your Coexistence Mall waitlist tracker is now ready for production use!**