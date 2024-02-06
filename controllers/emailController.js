const nodemailer = require("nodemailer");

const sendEmails = async (data, req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"UNTLD. 🔥" ${process.env.AUTH_EMAIL}`,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = sendEmails;
