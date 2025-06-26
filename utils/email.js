import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.PASSWORD
    },
    // For development with Mailtrap
    // host: 'smtp.mailtrap.io',
    // port: 2525,
    // auth: {
    //     user: 'your_mailtrap_user',
    //     pass: 'your_mailtrap_password'
    // }
});

// Email template path
const emailTemplateDir = path.join(__dirname, '../views/emails');

// Send email
const sendEmail = async (options) => {
    try {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(
            `${emailTemplateDir}/${options.template}.pug`,
            {
                firstName: options.firstName,
                url: options.url,
                subject: options.subject
            }
        );

        // 2) Define email options
        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            html,
            text: htmlToText(html)
        };

        // 3) Create a transport and send email
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending email:', err);
        throw new Error('There was an error sending the email. Try again later!');
    }
};

export default sendEmail;
