const dotenv = require('dotenv');
const {Resend} = require('resend')
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPostUser = async function (email, name, title, content) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Darryl <help@darrylmathias.tech>',
            to: [email],
            subject: `${name}, your post was a success!`,
            html: `
                <h4>Your post</h4>
                <h2>${title}</h2>
                <p>${content}</p><br>
                <p>Mail from team Write It</p>
            `
        });

        if (error) {
            return console.error({ error });
        }

        console.log({ data });
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

module.exports = sendPostUser