const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Send mail with defined transport object
    const message = {
        from: `${process.env.FROM_NAME || 'Lumière Camera Shop'} <${process.env.FROM_EMAIL || 'noreply@lumiere.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // Optional: if we want to send HTML email later
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error in sendEmail utility:', error);
        throw error; // Re-throw to be caught by the route handler
    }
};

module.exports = sendEmail;
