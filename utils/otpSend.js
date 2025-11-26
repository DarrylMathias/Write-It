const dotenv = require('dotenv');
const {Resend} = require('resend')
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTP(email, otp) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Darryl <help@darrylmathias.tech>',
            to: [email],
            subject: `One Time Password from Write It`,
            text: `Your OTP for current session is ${otp}. Current session expires in 5 minutes. Please don't share this OTP with anybody.`
        });

        if (error) {
            return console.error({ error });
        }

        console.log({ data });
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

module.exports = sendOTP