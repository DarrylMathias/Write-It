const dotenv = require('dotenv');
const userModel = require('../models/user')

const { Resend } = require('resend')
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY);

const newPostUser = async function (author, title, content) {

    const allUsers = await userModel.find()
    allUsers.forEach(async (user) => {
        try {
            setTimeout(() => { }, 1000);
            const { data, error } = await resend.emails.send({
                from: 'Darryl <help@darrylmathias.tech>',
                to: [user.email],
                subject: `New Post from, ${author} on Write It!`,
                html: `
                    <h2>${title}</h2>
                    <p>${content}</p><br>
                    <p>Post by ${author}</p>
                    <p>Mail from team <a href='https://write-it-dz2w.onrender.com/'>Write It</a></p>
                `
            });

            if (error) {
                return console.error({ error });
            }

            console.log({ data });
        } catch (err) {
            console.error("Failed to send email:", err);
        }
    });
}

module.exports = newPostUser