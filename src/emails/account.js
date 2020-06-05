const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_KEY);

function sendGreeting(userEmail, name) {
    sgMail.send({
        to: userEmail,
        from: 'countcynical@gmail.com',
        subject: 'Welcome To Task-App!',
        text: `Thank you for signing up, ${name}!`
    });
}

function sendAccountDeleteEmail(userEmail, name) {
    sgMail.send({
        to: userEmail,
        from: 'countcynical@gmail.com',
        subject: `Sorry to See You Go, ${name}`,
        text: `Please tell us how we failed you, dimbulbs`
    })
}

module.exports = {
    sendGreeting: sendGreeting,
    sendAccountDeleteEmail: sendAccountDeleteEmail
};