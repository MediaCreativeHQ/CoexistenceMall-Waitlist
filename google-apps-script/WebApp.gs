/**
 * Web App Handler for Custom Form Submissions
 * Add this to your Code.gs file for direct form integration
 */

/**
 * Handle POST requests from your custom HTML form
 * @param {Event} e - The POST event
 * @returns {ContentService.TextOutput} - JSON response
 */
function doPost(e) {
  try {
    logMessage('Received POST request from web form');
    
    // Parse the incoming data
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('No form data received');
    }
    
    // Validate required fields
    if (!data.email || !data.fullName) {
      throw new Error('Email and full name are required');
    }
    
    // Prepare row data for spreadsheet
    const rowData = [
      new Date(), // Timestamp
      data.email.trim().toLowerCase(),
      data.fullName.trim(),
      data.userType || '',
      data.businessName || '',
      data.businessEmail || '',
      '', // Email sent (will be updated by processSubmission)
      ''  // Status (will be updated by processSubmission)
    ];
    
    // Add to spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error('Waitlist sheet not found. Please run setup first.');
    }
    
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Process the submission (send welcome email, etc.)
    const result = processSubmission(rowData, newRow);
    
    logMessage(`Form submission processed: ${data.email}, Success: ${result.success}`);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Thank you for joining our waitlist!',
      emailSent: result.emailSent || false
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    logError('Error processing form submission', error);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Sorry, there was an error processing your submission. Please try again.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests - return a simple status page
 * @returns {HtmlService.HtmlOutput} - Status page
 */
function doGet() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Coexistence Mall Waitlist API</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .status { background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>🏪 Coexistence Mall Waitlist API</h1>
      
      <div class="status">
        <h2>✅ Service Status: Active</h2>
        <p>The waitlist tracker is running and ready to receive form submissions.</p>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="info">
        <h3>📝 Form Submission Endpoint</h3>
        <p>POST submissions to this URL with the following JSON structure:</p>
        <pre>{
  "email": "user@example.com",
  "fullName": "John Doe", 
  "userType": "Shopper",
  "businessName": "Optional Business Name",
  "businessEmail": "business@example.com"
}</pre>
      </div>
      
      <div class="info">
        <h3>📊 Response Format</h3>
        <p>Success Response:</p>
        <pre>{
  "success": true,
  "message": "Thank you for joining our waitlist!",
  "emailSent": true
}</pre>
        
        <p>Error Response:</p>
        <pre>{
  "success": false,
  "error": "Error message",
  "message": "User-friendly error message"
}</pre>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}