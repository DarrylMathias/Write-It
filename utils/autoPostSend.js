const dotenv = require('dotenv');
const { Resend } = require('resend')
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPostMail = async function (email, name, age, title, body) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Darryl <help@darrylmathias.tech>',
            to: [email],
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
        });

        if (error) {
            return console.error({ error });
        }

        console.log({ data });
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

module.exports = sendPostMail