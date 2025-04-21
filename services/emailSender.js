const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

module.exports = async function sendMail(toEmail, attachmentPath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"LeetCode Reporter" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "📄 Your Daily LeetCode Report",
    text: "Attached is your daily LeetCode progress report.",
    attachments: [
      {
        filename: path.basename(attachmentPath),
        path: attachmentPath,
      },
    ],
  });
};
