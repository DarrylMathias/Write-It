const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config()

const sendUserMail = function (email, name, age) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `New User, ${name} | ${email})`,
            html: `
                <h2>New User Update</h2>
                <strong>Name:</strong> ${name}<br>
                <strong>Email:</strong> ${email}<br><br>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

module.exports = sendUserMail