# 🚀 Deployment Checklist & Troubleshooting Guide

## ✅ **Pre-Deployment Checklist**

### **Google Apps Script Setup**
- [ ] Created Google Spreadsheet for waitlist tracking
- [ ] Added Apps Script project with `Code.gs` content
- [ ] Added `WebApp.gs` for form integration
- [ ] Authorized all required permissions
- [ ] Tested `onOpen()` function successfully
- [ ] Setup waitlist tracker with proper columns
- [ ] Tested welcome email functionality
- [ ] Created web app deployment
- [ ] Copied web app URL for form integration

### **HTML Form Integration**
- [ ] Updated `form-integration.js` with your web app URL
- [ ] Replaced existing form JavaScript in `index.html`
- [ ] Tested form submission locally
- [ ] Verified error handling works
- [ ] Tested success message display

### **Email Configuration**
- [ ] Customized email template with your branding
- [ ] Set appropriate reply-to email address
- [ ] Tested email delivery with various email providers
- [ ] Verified HTML email renders correctly
- [ ] Checked plain text version readability

## 🔧 **Integration Steps**

### **Step 1: Replace Form JavaScript**
Replace your current form script in `index.html` with the content from `form-integration.js`:

```html
<script>
    // Replace everything between <script> tags with form-integration.js content
    // Don't forget to update GOOGLE_APPS_SCRIPT_URL with your actual URL
</script>
```

### **Step 2: Deploy Apps Script as Web App**
1. In Apps Script Editor: **Deploy** → **New Deployment**
2. Type: **Web App**
3. Description: "Coexistence Mall Waitlist API"
4. Execute as: **Me (your email)**
5. Who has access: **Anyone**
6. Click **Deploy**
7. Copy the web app URL

### **Step 3: Update Configuration**
In your `form-integration.js`, replace:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
```
With your actual web app URL:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## 🧪 **Testing Protocol**

### **Local Testing**
1. Open your `index.html` in a browser
2. Fill out the form with test data
3. Submit and verify:
   - Loading state appears
   - Success message displays
   - No JavaScript errors in console

### **Google Sheets Testing**
1. Submit a test form entry
2. Check Google Sheets for new row
3. Verify all data fields populated correctly
4. Check "Email Sent" and "Status" columns

### **Email Testing**
1. Use your own email for test submissions
2. Verify welcome email arrives within 1-2 minutes
3. Check email formatting in different clients (Gmail, Outlook, etc.)
4. Test with different user types (Shopper, Vendor, etc.)

## 🚨 **Common Issues & Solutions**

### **❌ Form Not Submitting**
**Symptoms**: Button shows loading but nothing happens
**Solutions**:
- Check browser console for JavaScript errors
- Verify web app URL is correct
- Ensure web app has "Anyone" access permission
- Test web app URL directly in browser (should show status page)

### **❌ Emails Not Sending**
**Symptoms**: Data appears in sheets but no emails
**Solutions**:
- Check Gmail daily sending limit (100 emails/day)
- Verify email addresses are valid
- Check Gmail spam folder
- Review Apps Script execution transcript for errors
- Ensure proper email permissions are granted

### **❌ Duplicate Detection Not Working**
**Symptoms**: Same email appears multiple times
**Solutions**:
- Verify column mapping in CONFIG object
- Check case sensitivity in email comparison
- Ensure email column is correctly identified
- Review `isDuplicateEmail()` function logic

### **❌ CORS Errors**
**Symptoms**: "Access blocked by CORS policy" in console
**Solutions**:
- Ensure web app deployment has "Anyone" access
- Use POST method (not GET) for form submission
- Try redeploying web app with new version
- Check if browser is blocking third-party scripts

### **❌ Data Missing in Sheets**
**Symptoms**: Form submits but no data in spreadsheet
**Solutions**:
- Verify sheet name matches CONFIG.SHEET_NAME
- Check column mapping in COLUMNS configuration
- Ensure spreadsheet permissions allow writing
- Review doPost() function for errors

## 📊 **Monitoring & Analytics**

### **Apps Script Monitoring**
- Check execution transcript regularly for errors
- Monitor trigger execution history
- Review email quota usage
- Set up error notifications for admin

### **Form Analytics**
Add tracking to monitor:
- Form submission rates
- Error rates
- Email delivery success
- User type distribution

### **Google Sheets Analytics**
Use the built-in analytics menu:
- Total submissions
- Email delivery rates
- Interest type breakdown
- Submission trends over time

## 🛠️ **Maintenance Tasks**

### **Weekly**
- [ ] Review submission data for quality
- [ ] Check email delivery rates
- [ ] Monitor error logs
- [ ] Verify trigger is still active

### **Monthly**
- [ ] Update email template if needed
- [ ] Review and update user interest categories
- [ ] Backup spreadsheet data
- [ ] Check Gmail quota usage

### **Quarterly**
- [ ] Review and optimize email content
- [ ] Update branding elements
- [ ] Analyze conversion rates
- [ ] Plan feature enhancements

## 📞 **Support Resources**

### **Google Apps Script Documentation**
- [Apps Script Guide](https://developers.google.com/apps-script)
- [Gmail Service](https://developers.google.com/apps-script/reference/gmail)
- [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)

### **Debugging Tools**
- Apps Script Editor → Execution Transcript
- Browser Developer Tools → Console
- Google Sheets → Version History
- Gmail → Sent folder for email verification

### **Error Codes Reference**
- `Invalid email format` → Check email validation regex
- `Waitlist sheet not found` → Run setup function
- `Insufficient permissions` → Re-authorize Apps Script
- `Quota exceeded` → Check Gmail daily limits

---

**🎯 Your Coexistence Mall waitlist tracker is production-ready!**

For additional support or custom modifications, refer to the code comments and Google Apps Script documentation.