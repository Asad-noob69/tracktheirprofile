export async function sendNewUserNotification(user: {
  email: string;
  username: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const fromEmail = process.env.SMTP_FROM || "noreply@tracktheirprofile.com";

  if (!smtpHost || !smtpUser || !smtpPass || !adminEmail) {
    console.log("[email] SMTP not configured, skipping new user notification");
    return;
  }

  try {
    // Use fetch to Resend API if host is resend, otherwise use raw SMTP via API
    if (smtpHost.includes("resend")) {
      // Resend HTTP API — simpler and more reliable
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${smtpPass}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminEmail],
          subject: `New User Signup: ${user.username}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #22c55e; margin-bottom: 16px;">New User Registered</h2>
              <div style="background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px;">
                <p style="color: #e4e4e7; margin: 0 0 8px;"><strong>Username:</strong> ${user.username}</p>
                <p style="color: #e4e4e7; margin: 0 0 8px;"><strong>Email:</strong> ${user.email}</p>
                <p style="color: #a1a1aa; margin: 0; font-size: 14px;"><strong>Signed up via:</strong> Google OAuth</p>
              </div>
              <p style="color: #71717a; font-size: 12px; margin-top: 16px;">— TrackTheirProfile</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[email] Resend API error:", err);
      } else {
        console.log("[email] New user notification sent to", adminEmail);
      }
    }
  } catch (err) {
    console.error("[email] Failed to send notification:", err);
  }
}
