const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config()

const sendPostUser = function (email, name, title, content) {
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
            to: email,
            subject: `${name}, your post was a success!`,
            html: `
                <h4>Your post</h4>
                <h2>${title}</h2>
                <p>${content}</p><br>
                <p>Mail from team Write It</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
            } else {
                console.log(`Email sent to ${user.email}`, info.response);
            }
        });
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

module.exports = sendPostUser