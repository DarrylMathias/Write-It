const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config()

function sendOTP(email, otp){
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
            subject: `One Time Password from Write It`,
            text : `Your OTP for current session is ${otp}. Current session expires in 5 minutes. Please don't share this OTP with anybody.`
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

module.exports = sendOTP