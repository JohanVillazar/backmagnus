import nodemailer from "nodemailer";
import fs from "fs";


export const sendCashRegisterEmail = async (toEmail, pdfPath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Tu correo Gmail
        pass: process.env.EMAIL_PASS, // Contraseña o App Password
      },
    });

    const mailOptions = {
      from: `"Magnus POS" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "📄 Tirilla de cierre de caja",
      text: "Adjunto cierre de caja del turno de hoy.",
      attachments: [
        {
          filename: "cierre_caja.pdf",
          content: fs.createReadStream(pdfPath),
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado correctamente a:", toEmail);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
  }
};