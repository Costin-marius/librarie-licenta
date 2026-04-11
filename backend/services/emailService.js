const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525, 
    auth: {
        user: process.env.SMTP2GO_USER,
        pass: process.env.SMTP2GO_PASS
    }
});

/**
 * Trimite un email
 * @param {string} to - Adresa de email a destinatarului
 * @param {string} subject - Subiectul emailului
 * @param {string} html - Conținutul HTML al emailului
 */
const trimiteEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"BookIo" <costinmarius23@stud.ase.ro>', // poți modifica adresa de sender dacă vrei
            to,
            subject,
            html
        });
        console.log("Email trimis: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Eroare la trimiterea emailului: ", error);
        throw error;
    }
};

module.exports = {
    trimiteEmail
};
