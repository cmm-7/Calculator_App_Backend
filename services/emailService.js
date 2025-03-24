const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.error("❌ SendGrid API key is missing!");
} else {
  console.log("✅ SendGrid API key is configured");
  sgMail.setApiKey(apiKey);
}

const sendVerificationCode = async (email, code) => {
  try {
    console.log(`🔄 Preparing to send verification code to ${email}...`);

    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error("SendGrid sender email is not configured");
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Your Two-Factor Authentication Code",
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Two-Factor Authentication Code</h2>
          <p>Your verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #4A5568;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    console.log(
      "📧 Sending verification email with the following configuration:"
    );
    console.log("- From:", process.env.SENDGRID_FROM_EMAIL);
    console.log("- To:", email);
    console.log("- Subject:", msg.subject);

    const response = await sgMail.send(msg);
    console.log("✅ Verification email sent successfully!");
    console.log(
      "SendGrid Response:",
      response[0].statusCode,
      response[0].headers
    );
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    if (error.response) {
      console.error("SendGrid Error Details:");
      console.error("- Status Code:", error.response.statusCode);
      console.error("- Body:", JSON.stringify(error.response.body, null, 2));
      console.error("- Headers:", error.response.headers);
    }
    throw new Error(`Failed to send verification code: ${error.message}`);
  }
};

module.exports = {
  sendVerificationCode,
};
