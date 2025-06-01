const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config()

const sendPostMail = function (email, name, age, title, body) {
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
            subject: `New Post from ${name} | ${email}, (${age})`,
            html: `
                <h2>New Post Submission</h2>
                <strong>Name:</strong> ${name}<br>
                <strong>Email:</strong> ${email}<br>
                <strong>Age:</strong> ${age}<br><br>
                <strong>Title:</strong> ${title}<br><br>
                <strong>Body:</strong><br>
                <p>${body}</p>
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

module.exports = sendPostMail