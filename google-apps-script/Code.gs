/**
 * Coexistence Mall Waitlist Tracker
 * Google Apps Script for automated welcome emails and data management
 * 
 * Author: AI Assistant
 * Created: October 12, 2025
 * Version: 1.0.0
 */

// Configuration constants
const CONFIG = {
  SHEET_NAME: 'Waitlist Submissions',
  EMAIL_TEMPLATE: {
    SUBJECT: 'Welcome to the Coexistence Mall Revolution! 🚀',
    FROM_NAME: 'Coexistence Mall Team'
  },
  COLUMNS: {
    TIMESTAMP: 0,
    EMAIL: 1,
    NAME: 2,
    INTEREST: 3,
    BUSINESS_NAME: 4,
    BUSINESS_EMAIL: 5,
    EMAIL_SENT: 6,
    STATUS: 7
  },
  LOGGING: true
};

/**
 * Called when the spreadsheet is opened
 * Creates custom menu for easy access to functions
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🏪 Coexistence Mall')
      .addItem('📧 Send Welcome Email to Latest', 'sendWelcomeToLatest')
      .addItem('📊 Setup Waitlist Tracker', 'setupWaitlistTracker')
      .addItem('🔗 Setup Form Trigger', 'setupTrigger')
      .addItem('📈 View Analytics', 'showAnalytics')
      .addItem('🧪 Test Welcome Email', 'testWelcomeEmail')
      .addSeparator()
      .addItem('⚙️ Settings', 'showSettings')
      .addToUi();
    
    logMessage('Custom menu created successfully');
  } catch (error) {
    logError('Error creating menu', error);
  }
}

/**
 * Main trigger function - called when form is submitted
 * @param {Event} e - The form submit event
 */
function onFormSubmit(e) {
  try {
    logMessage('Form submission triggered');
    
    if (!e || !e.values) {
      throw new Error('Invalid form submission event');
    }
    
    // Process the submission
    const result = processSubmission(e.values, e.range.getRow());
    
    if (result.success) {
      logMessage(`Successfully processed submission for ${result.email}`);
    } else {
      logError('Failed to process submission', result.error);
    }
    
  } catch (error) {
    logError('Error in onFormSubmit', error);
    // Send error notification to admin
    sendErrorNotification('Form Submission Error', error);
  }
}

/**
 * Process and validate form submission data
 * @param {Array} rowData - Array of form submission values
 * @param {number} rowNumber - Row number in the sheet
 * @returns {Object} - Result object with success status and data
 */
function processSubmission(rowData, rowNumber = null) {
  try {
    // Validate required data
    if (!rowData || rowData.length < 3) {
      throw new Error('Insufficient form data provided');
    }
    
    const submissionData = {
      timestamp: rowData[CONFIG.COLUMNS.TIMESTAMP] || new Date(),
      email: (rowData[CONFIG.COLUMNS.EMAIL] || '').trim().toLowerCase(),
      name: (rowData[CONFIG.COLUMNS.NAME] || '').trim(),
      interest: rowData[CONFIG.COLUMNS.INTEREST] || '',
      businessName: rowData[CONFIG.COLUMNS.BUSINESS_NAME] || '',
      businessEmail: (rowData[CONFIG.COLUMNS.BUSINESS_EMAIL] || '').trim().toLowerCase()
    };
    
    // Validate email format
    if (!isValidEmail(submissionData.email)) {
      throw new Error(`Invalid email format: ${submissionData.email}`);
    }
    
    // Check for duplicates
    if (isDuplicateEmail(submissionData.email, rowNumber)) {
      logMessage(`Duplicate email detected: ${submissionData.email}`);
      updateRowStatus(rowNumber, 'DUPLICATE', 'No');
      return { success: false, error: 'Duplicate email', email: submissionData.email };
    }
    
    // Send welcome email
    const emailResult = sendWelcomeEmail(submissionData.email, submissionData.name, submissionData.interest);
    
    // Update row with email status
    if (rowNumber) {
      updateRowStatus(rowNumber, emailResult.success ? 'PROCESSED' : 'EMAIL_FAILED', emailResult.success ? 'Yes' : 'No');
    }
    
    return {
      success: true,
      email: submissionData.email,
      name: submissionData.name,
      emailSent: emailResult.success
    };
    
  } catch (error) {
    logError('Error processing submission', error);
    if (rowNumber) {
      updateRowStatus(rowNumber, 'ERROR', 'No');
    }
    return { success: false, error: error.message };
  }
}

/**
 * Send automated welcome email to new subscriber
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} interest - User's interest type
 * @returns {Object} - Result object with success status
 */
function sendWelcomeEmail(email, name, interest = '') {
  try {
    if (!email || !isValidEmail(email)) {
      throw new Error('Invalid email address provided');
    }
    
    const firstName = extractFirstName(name);
    const emailContent = generateEmailContent(firstName, interest);
    
    // Send HTML email
    GmailApp.sendEmail(
      email,
      CONFIG.EMAIL_TEMPLATE.SUBJECT,
      emailContent.textVersion,
      {
        htmlBody: emailContent.htmlVersion,
        name: CONFIG.EMAIL_TEMPLATE.FROM_NAME,
        replyTo: getReplyToEmail()
      }
    );
    
    logMessage(`Welcome email sent successfully to ${email}`);
    
    return { success: true, email: email };
    
  } catch (error) {
    logError(`Failed to send welcome email to ${email}`, error);
    return { success: false, error: error.message, email: email };
  }
}

/**
 * Generate personalized email content
 * @param {string} firstName - Recipient's first name
 * @param {string} interest - User's interest type
 * @returns {Object} - Object containing HTML and text versions
 */
function generateEmailContent(firstName, interest) {
  const personalizedGreeting = firstName ? `Hi ${firstName}` : 'Hello there';
  const interestMessage = getInterestSpecificMessage(interest);
  
  const htmlVersion = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Coexistence Mall</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%); color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border-radius: 20px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #7e22ce 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 2.5rem; font-weight: 800; color: #ffffff; text-shadow: 0 0 30px rgba(0, 212, 255, 0.3);">
                🏪 Coexistence Mall
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 1.1rem; color: rgba(255, 255, 255, 0.9);">
                The Future of Digital Commerce
            </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #00d4ff; font-size: 1.8rem; margin-bottom: 20px;">
                ${personalizedGreeting}! 🎉
            </h2>
            
            <p style="font-size: 1.1rem; line-height: 1.6; color: #e2e8f0; margin-bottom: 25px;">
                Welcome to the <strong style="color: #00d4ff;">Coexistence Mall revolution</strong>! You're now part of an exclusive community that's about to reshape digital commerce forever.
            </p>
            
            ${interestMessage}
            
            <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 15px; padding: 25px; margin: 30px 0;">
                <h3 style="color: #00d4ff; margin-top: 0; margin-bottom: 15px;">🚀 What's Next?</h3>
                <ul style="color: #e2e8f0; line-height: 1.8; padding-left: 20px;">
                    <li>You'll receive <strong>exclusive early access</strong> before public launch</li>
                    <li>Get <strong>special discounts</strong> and lifetime benefits</li>
                    <li>Be the first to know about new features and updates</li>
                    <li>Join our private community of early adopters</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="https://coexistencemall.com" style="display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #7e22ce 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: 600; font-size: 1.1rem; transition: all 0.3s ease;">
                    🌟 Visit Our Website
                </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6;">
                Stay tuned for exciting updates! We're working hard to bring you the most innovative digital commerce platform ever created.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: rgba(0, 0, 0, 0.3); padding: 25px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">
                © 2025 Coexistence Mall. Building the future of digital commerce.
            </p>
            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 0.8rem;">
                You received this email because you joined our waitlist. 
                <a href="#" style="color: #00d4ff; text-decoration: none;">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>`;

  const textVersion = `
🏪 COEXISTENCE MALL - Welcome to the Revolution!

${personalizedGreeting}! 🎉

Welcome to the Coexistence Mall revolution! You're now part of an exclusive community that's about to reshape digital commerce forever.

${getInterestSpecificMessageText(interest)}

🚀 WHAT'S NEXT?
• You'll receive exclusive early access before public launch
• Get special discounts and lifetime benefits  
• Be the first to know about new features and updates
• Join our private community of early adopters

Stay tuned for exciting updates! We're working hard to bring you the most innovative digital commerce platform ever created.

Visit our website: https://coexistencemall.com

---
© 2025 Coexistence Mall. Building the future of digital commerce.
You received this email because you joined our waitlist.
`;

  return { htmlVersion, textVersion };
}

/**
 * Get interest-specific message for HTML email
 * @param {string} interest - User's interest type
 * @returns {string} - HTML message
 */
function getInterestSpecificMessage(interest) {
  const messages = {
    'Shopper': `
      <div style="background: rgba(0, 255, 255, 0.1); border-left: 4px solid #00ffff; padding: 20px; margin: 25px 0; border-radius: 0 10px 10px 0;">
        <h4 style="color: #00ffff; margin-top: 0;">🛍️ For Shoppers Like You</h4>
        <p style="color: #e2e8f0; margin-bottom: 0;">Get ready to discover unique products, compare prices across vendors, and enjoy a seamless shopping experience like never before!</p>
      </div>`,
    'Vendor': `
      <div style="background: rgba(126, 34, 206, 0.1); border-left: 4px solid #7e22ce; padding: 20px; margin: 25px 0; border-radius: 0 10px 10px 0;">
        <h4 style="color: #a855f7; margin-top: 0;">🏪 For Vendors Like You</h4>
        <p style="color: #e2e8f0; margin-bottom: 0;">Prepare to access powerful tools for inventory management, customer reach, and sales analytics that will transform your business!</p>
      </div>`,
    'Supplier': `
      <div style="background: rgba(0, 212, 255, 0.1); border-left: 4px solid #00d4ff; padding: 20px; margin: 25px 0; border-radius: 0 10px 10px 0;">
        <h4 style="color: #00d4ff; margin-top: 0;">📦 For Suppliers Like You</h4>
        <p style="color: #e2e8f0; margin-bottom: 0;">Get ready to streamline B2B operations, connect with verified vendors, and manage wholesale orders efficiently!</p>
      </div>`,
    'Investor': `
      <div style="background: rgba(255, 215, 0, 0.1); border-left: 4px solid #ffd700; padding: 20px; margin: 25px 0; border-radius: 0 10px 10px 0;">
        <h4 style="color: #ffd700; margin-top: 0;">💰 For Investors Like You</h4>
        <p style="color: #e2e8f0; margin-bottom: 0;">Discover exclusive investment opportunities in the next generation of digital commerce platforms!</p>
      </div>`
  };
  
  return messages[interest] || `
    <div style="background: rgba(0, 212, 255, 0.1); border-left: 4px solid #00d4ff; padding: 20px; margin: 25px 0; border-radius: 0 10px 10px 0;">
      <h4 style="color: #00d4ff; margin-top: 0;">🌟 Welcome to Our Community</h4>
      <p style="color: #e2e8f0; margin-bottom: 0;">You're about to experience the future of digital commerce. Get ready for something amazing!</p>
    </div>`;
}

/**
 * Get interest-specific message for text email
 * @param {string} interest - User's interest type  
 * @returns {string} - Text message
 */
function getInterestSpecificMessageText(interest) {
  const messages = {
    'Shopper': '🛍️ As a shopper, get ready to discover unique products, compare prices across vendors, and enjoy a seamless shopping experience like never before!',
    'Vendor': '🏪 As a vendor, prepare to access powerful tools for inventory management, customer reach, and sales analytics that will transform your business!',
    'Supplier': '📦 As a supplier, get ready to streamline B2B operations, connect with verified vendors, and manage wholesale orders efficiently!',
    'Investor': '💰 As an investor, discover exclusive investment opportunities in the next generation of digital commerce platforms!'
  };
  
  return messages[interest] || '🌟 You\'re about to experience the future of digital commerce. Get ready for something amazing!';
}

/**
 * Setup the waitlist tracker spreadsheet
 */
function setupWaitlistTracker() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    }
    
    // Setup headers
    const headers = ['Timestamp', 'Email', 'Name', 'Interest', 'Business Name', 'Business Email', 'Email Sent', 'Status'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    
    // Set column widths
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 200); // Email
    sheet.setColumnWidth(3, 150); // Name
    sheet.setColumnWidth(4, 120); // Interest
    sheet.setColumnWidth(5, 150); // Business Name
    sheet.setColumnWidth(6, 200); // Business Email
    sheet.setColumnWidth(7, 100); // Email Sent
    sheet.setColumnWidth(8, 120); // Status
    
    SpreadsheetApp.getUi().alert('✅ Waitlist tracker setup complete!');
    logMessage('Waitlist tracker setup completed');
    
  } catch (error) {
    logError('Error setting up waitlist tracker', error);
    SpreadsheetApp.getUi().alert('❌ Error setting up tracker: ' + error.message);
  }
}

/**
 * Setup form submission trigger
 */
function setupTrigger() {
  try {
    // Delete existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'onFormSubmit') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new trigger
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ScriptApp.newTrigger('onFormSubmit')
      .timeBased()
      .everyMinutes(1) // Check for new submissions every minute
      .create();
    
    // Alternative: Form-based trigger (if using Google Forms)
    // ScriptApp.newTrigger('onFormSubmit')
    //   .timeBased()
    //   .onFormSubmit()
    //   .create();
    
    SpreadsheetApp.getUi().alert('✅ Form trigger setup complete!');
    logMessage('Form submission trigger created');
    
  } catch (error) {
    logError('Error setting up trigger', error);
    SpreadsheetApp.getUi().alert('❌ Error setting up trigger: ' + error.message);
  }
}

/**
 * Send welcome email to the latest submission
 */
function sendWelcomeToLatest() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error('Waitlist sheet not found. Please run setup first.');
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert('No submissions found.');
      return;
    }
    
    const rowData = sheet.getRange(lastRow, 1, 1, 8).getValues()[0];
    const email = rowData[CONFIG.COLUMNS.EMAIL];
    const name = rowData[CONFIG.COLUMNS.NAME];
    const interest = rowData[CONFIG.COLUMNS.INTEREST];
    
    const result = sendWelcomeEmail(email, name, interest);
    
    if (result.success) {
      updateRowStatus(lastRow, 'MANUAL_SEND', 'Yes');
      SpreadsheetApp.getUi().alert(`✅ Welcome email sent to ${email}`);
    } else {
      SpreadsheetApp.getUi().alert(`❌ Failed to send email: ${result.error}`);
    }
    
  } catch (error) {
    logError('Error sending welcome email to latest', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Test welcome email functionality
 */
function testWelcomeEmail() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const result = sendWelcomeEmail(userEmail, 'Test User', 'Shopper');
    
    if (result.success) {
      SpreadsheetApp.getUi().alert(`✅ Test email sent to ${userEmail}`);
    } else {
      SpreadsheetApp.getUi().alert(`❌ Test failed: ${result.error}`);
    }
    
  } catch (error) {
    logError('Error testing welcome email', error);
    SpreadsheetApp.getUi().alert('❌ Test error: ' + error.message);
  }
}

/**
 * Show analytics dashboard
 */
function showAnalytics() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Waitlist sheet not found.');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const totalSubmissions = data.length - 1; // Exclude header
    
    if (totalSubmissions === 0) {
      SpreadsheetApp.getUi().alert('📊 No submissions yet.');
      return;
    }
    
    // Count by interest type
    const interestCounts = {};
    const emailsSent = data.filter((row, index) => index > 0 && row[CONFIG.COLUMNS.EMAIL_SENT] === 'Yes').length;
    
    for (let i = 1; i < data.length; i++) {
      const interest = data[i][CONFIG.COLUMNS.INTEREST] || 'Unknown';
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    }
    
    const analytics = `
📊 COEXISTENCE MALL ANALYTICS

Total Submissions: ${totalSubmissions}
Welcome Emails Sent: ${emailsSent}
Success Rate: ${totalSubmissions > 0 ? Math.round((emailsSent / totalSubmissions) * 100) : 0}%

BREAKDOWN BY INTEREST:
${Object.entries(interestCounts).map(([interest, count]) => `• ${interest}: ${count}`).join('\n')}

Last Updated: ${new Date().toLocaleString()}
    `;
    
    SpreadsheetApp.getUi().alert(analytics);
    
  } catch (error) {
    logError('Error showing analytics', error);
    SpreadsheetApp.getUi().alert('❌ Analytics error: ' + error.message);
  }
}

/**
 * Show settings dialog
 */
function showSettings() {
  const settings = `
⚙️ COEXISTENCE MALL SETTINGS

Current Configuration:
• Sheet Name: ${CONFIG.SHEET_NAME}
• Email Subject: ${CONFIG.EMAIL_TEMPLATE.SUBJECT}
• From Name: ${CONFIG.EMAIL_TEMPLATE.FROM_NAME}
• Logging: ${CONFIG.LOGGING ? 'Enabled' : 'Disabled'}

To modify settings, edit the CONFIG object in the script.
  `;
  
  SpreadsheetApp.getUi().alert(settings);
}

// UTILITY FUNCTIONS

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check for duplicate email
 * @param {string} email - Email to check
 * @param {number} currentRow - Current row number to exclude
 * @returns {boolean} - True if duplicate found
 */
function isDuplicateEmail(email, currentRow) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) return false;
    
    const emails = sheet.getRange(2, CONFIG.COLUMNS.EMAIL + 1, sheet.getLastRow() - 1, 1).getValues();
    
    for (let i = 0; i < emails.length; i++) {
      const rowNumber = i + 2; // Adjust for header and 0-based index
      if (rowNumber !== currentRow && emails[i][0].toString().toLowerCase() === email.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logError('Error checking duplicate email', error);
    return false;
  }
}

/**
 * Extract first name from full name
 * @param {string} fullName - Full name string
 * @returns {string} - First name
 */
function extractFirstName(fullName) {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0];
}

/**
 * Update row status and email sent flag
 * @param {number} rowNumber - Row number to update
 * @param {string} status - Status to set
 * @param {string} emailSent - Email sent flag ('Yes' or 'No')
 */
function updateRowStatus(rowNumber, status, emailSent) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet || !rowNumber) return;
    
    sheet.getRange(rowNumber, CONFIG.COLUMNS.EMAIL_SENT + 1).setValue(emailSent);
    sheet.getRange(rowNumber, CONFIG.COLUMNS.STATUS + 1).setValue(status);
    
  } catch (error) {
    logError('Error updating row status', error);
  }
}

/**
 * Get reply-to email address
 * @returns {string} - Reply-to email
 */
function getReplyToEmail() {
  // You can customize this to your preferred reply-to email
  return Session.getActiveUser().getEmail();
}

/**
 * Send error notification to admin
 * @param {string} subject - Error subject
 * @param {Error} error - Error object
 */
function sendErrorNotification(subject, error) {
  try {
    const adminEmail = Session.getActiveUser().getEmail();
    const errorDetails = `
Error: ${error.message}
Stack: ${error.stack}
Time: ${new Date().toLocaleString()}
Script: Coexistence Mall Waitlist Tracker
    `;
    
    GmailApp.sendEmail(
      adminEmail,
      `🚨 ${subject} - Coexistence Mall`,
      errorDetails
    );
  } catch (e) {
    console.error('Failed to send error notification:', e);
  }
}

/**
 * Log message to console
 * @param {string} message - Message to log
 */
function logMessage(message) {
  if (CONFIG.LOGGING) {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
  }
}

/**
 * Log error to console
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
function logError(message, error) {
  if (CONFIG.LOGGING) {
    console.error(`[${new Date().toLocaleString()}] ERROR: ${message}`, error);
  }
}