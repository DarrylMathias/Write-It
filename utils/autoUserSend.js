const dotenv = require('dotenv');

const {Resend} = require('resend')
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY);

const sendUserMail = async function (email, name, age) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Darryl <help@darrylmathias.tech>',
            to: ['darrylnevmat@gmail.com'],
            subject: `New User, ${name} | ${email})`,
            html: `
                <h2>New User Update</h2>
                <strong>Name:</strong> ${name}<br>
                <strong>Email:</strong> ${email}<br><br>
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

module.exports = sendUserMail