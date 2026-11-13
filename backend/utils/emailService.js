import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[Email] Email not configured — skipping send to:", to);
    return { success: false, reason: "Email not configured" };
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Univenty Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("[Email] Sent to:", to, " | Subject:", subject);
    return { success: true };
  } catch (err) {
    console.error("[Email] Failed:", err.message);
    return { success: false, reason: err.message };
  }
};

export const registrationApprovedEmail = (studentName, eventName, eventDate) => ({
  subject: `✅ Registration Approved — ${eventName}`,
  html: `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f7f4; padding: 32px; border-radius: 12px;">
      <div style="background: #4a5e3a; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin:0; font-size: 22px;">🎉 You're In!</h2>
        <p style="margin: 8px 0 0; opacity: 0.85;">Your registration has been approved</p>
      </div>
      <p>Hi <strong>${studentName}</strong>,</p>
      <p>Great news! Your registration for <strong>${eventName}</strong> has been <span style="color:#4a5e3a; font-weight:600;">approved</span>.</p>
      <p><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      <p>Please log in to Univenty to view your QR code ticket.</p>
      <div style="margin-top: 24px; padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e5e7e0;">
        <p style="margin:0; color: #6b7280; font-size: 13px;">This is an automated message from Univenty — University Events Management Platform.</p>
      </div>
    </div>
  `,
});

export const registrationRejectedEmail = (studentName, eventName) => ({
  subject: `Registration Update — ${eventName}`,
  html: `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f7f4; padding: 32px; border-radius: 12px;">
      <div style="background: #7f1d1d; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin:0; font-size: 22px;">Registration Status Update</h2>
      </div>
      <p>Hi <strong>${studentName}</strong>,</p>
      <p>Unfortunately, your registration request for <strong>${eventName}</strong> was not approved this time.</p>
      <p>You can explore other events on Univenty and apply again.</p>
      <div style="margin-top: 24px; padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e5e7e0;">
        <p style="margin:0; color: #6b7280; font-size: 13px;">This is an automated message from Univenty.</p>
      </div>
    </div>
  `,
});

export const eventApprovedEmail = (organiserName, eventName) => ({
  subject: `✅ Event Approved — ${eventName}`,
  html: `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f7f4; padding: 32px; border-radius: 12px;">
      <div style="background: #4a5e3a; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin:0; font-size: 22px;">🎉 Event Approved!</h2>
      </div>
      <p>Hi <strong>${organiserName}</strong>,</p>
      <p>Your event <strong>${eventName}</strong> has been <span style="color:#4a5e3a; font-weight:600;">approved</span> by the administrator and is now live on Univenty.</p>
      <p>Students can now discover and register for your event.</p>
      <div style="margin-top: 24px; padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e5e7e0;">
        <p style="margin:0; color: #6b7280; font-size: 13px;">This is an automated message from Univenty.</p>
      </div>
    </div>
  `,
});
