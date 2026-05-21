const nodemailer = require('nodemailer');
require('dotenv').config();

// Create SMTP transporter using AWS SES SMTP credentials (same as drb_payment_reminder.php)
const transporter = nodemailer.createTransport({
  host: process.env.AWS_SMTP_HOST || 'email-smtp.ap-south-1.amazonaws.com',
  port: parseInt(process.env.AWS_SMTP_PORT || '587'),
  secure: false, // false for 587 (uses STARTTLS)
  auth: {
    user: process.env.AWS_ACCESS_KEY_ID, // SMTP username (AKIAUNMUTDBFRUJNI67U)
    pass: process.env.AWS_SECRET_ACCESS_KEY // SMTP password
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Generate email body HTML template (same format as sms_gate.php)
 * @param {Object} data - Email data
 * @returns {string} - HTML body
 */
const generateEmailBody = (data) => {
  const {
    facultyName,
    evaId,
    tempPassword,
    subjectDetails, // Array of {subcode, subname, evaDate}
    currentDate,
    referenceNo,
    InstitutionName
  } = data;

  // Generate subject rows
  const subjectRows = subjectDetails.map((subject, index) => `
    <tr style="border: 1px solid black;">
      <td style="border: 1px solid black;">${index + 1}</td>
      <td style="border: 1px solid black;">${facultyName}</td>
      <td style="border: 1px solid black;">${subject.subcode} ( ${subject.subname} )</td>
      <td style="border: 1px solid black;">${subject.evaDate}</td>
    </tr>
  `).join('');

  return `
    <head>
      <style>
        #testid{
          font-family: "Times New Roman", Times, serif;
          font-size: 16px;
          font-color: black;
        }
      </style>
    </head>
    <body style="margin: 0px;">
      <div id="testid" align="center">
        <b><span style="font-size: 36px;">${InstitutionName }</span></b><br>
        <span>(A Govt. Aided Autonomous Institution Affiliated to Anna University)</span><br>
        <span>Madurai 625 015</span><br>
        <span style="font-size: 26px;"><b>Office of the Controller of Examinations</b></span>
      </div>
      <br><hr>
      <p align="left" style="padding-left: 48.5px;">${referenceNo }
      <span style="float:right;">${currentDate}</span></p>
      <div align="center"><p>CONFIDENTIAL</p></div>
      <div style="margin-left:4%"> 
        To<br>${facultyName}<br>${InstitutionName}.<br>
        Sir,<br>
        <b>Sub.:</b> APRIL 2025 Terminal Examinations – Phase 2 – Digital Valuation – Order - Reg.<br>
        <div style="margin-left: 43%;">------------- x ------------- </div>
        I am glad to appoint you as an Examiner for the valuation of the Course<br>
        <br>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 16px;">
          <thead style="border: 1px solid black;">
            <tr>
              <th style="border: 1px solid black;">SNO</th>
              <th style="border: 1px solid black;">EXAMINER</th>
              <th style="border: 1px solid black;">COURSE CODE</th>
              <th style="border: 1px solid black;">EVALUATION START DATE</th>
            </tr>
          </thead>
          <tbody style="text-align: center;">
            ${subjectRows}
          </tbody>
        </table>
        <br>Kindly keep the confidentiality and do not disclose this offer with any staff/students. If any of your ward/relative appeared for this course, kindly decline this offer immediately.<br>
        The details of the Valuation Schedule:<br>
        <div style="margin-left:25%">
          <ul>
            <li>Login Credentials : <span style="padding-left: 23px;"> User id</span><span style="padding-left: 21px;">: ${evaId}</span></li>
            <span style="padding-left: 151.5px;">Password : ${tempPassword}</span><br>
            <li>Venue               <span style="padding-left: 156px;">: L5 Hall (Near COE Office)</span></li>
            <li>Valuation Sessions  <span style="padding-left: 83px;">: FN - 09.15 A.M to 12.45 P.M</span></li>
            <span style="padding-left: 219px;">AN - 01.15 P.M to 04.45 P.M</span><br>
            <li>Maximum Answer Scripts per day : <b>60 Approximately</b>.</li>
          </ul>
        </div>
        <div style="margin-left:0%"> Kindly adhere to the above schedule and complete the valuation.</div><br>
        <div align="right">
          <br>Dr.N.KAMARAJ&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
          Controller of Examinations
        </div>
      </div>
    </body>
  `;
};

/**
 * Sends an email using AWS SES SMTP (same method as drb_payment_reminder.php and sms_gate.php)
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject (default: "APRIL 2025 Terminal Examinations - Phase 2 - Digital Valuation - Appointment Order - Reg.")
 * @param {string|Object} body - HTML email body string OR data object for template generation
 * @returns {Promise} - Promise resolving to email send result
 */
const sendEmail = async (to, subject, body) => {
  // Validate SMTP credentials are configured
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('⚠️ AWS SMTP credentials not configured - skipping email');
    return {
      success: false,
      message: 'AWS SMTP credentials not configured',
      skipped: true
    };
  }

  // Default subject from sms_gate.php
  const defaultSubject = "APRIL 2025 Terminal Examinations - Phase 2 - Digital Valuation - Appointment Order - Reg.";
  
  // If body is an object with template data, generate HTML
  let htmlBody = body;
  if (typeof body === 'object' && !Array.isArray(body)) {
    htmlBody = generateEmailBody(body);
  }

  const mailOptions = {
    from: process.env.EMAIL_SENDER || 'info@tnexams.net',
    to: Array.isArray(to) ? to.join(', ') : to,
    subject: subject || defaultSubject,
    html: htmlBody
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`, result.messageId);
    return {
      success: true,
      result,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);

    // Handle specific SMTP errors
    if (error.code === 'EAUTH') {
      console.error('SMTP authentication failed. Check credentials in .env');
    }

    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
};

module.exports = {
  sendEmail,
  generateEmailBody
};
