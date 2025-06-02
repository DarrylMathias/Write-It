const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const userModel = require('../models/user')
dotenv.config()

const newPostUser = async function (author, title, content) {

    const allUsers = await userModel.find()
    allUsers.forEach(user => {
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
                to: user.email,
                subject: `New Post from, ${author} on Write It!`,
                html: `
                <h2>${title}</h2>
                <p>${content}</p><br>
                <p>Post by ${author}</p>
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
    });
}

module.exports = newPostUser