
const sgMail = require('@sendgrid/mail')
async function sendMail(options) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail
      .send(options)
      .then(() => {
      })
      .catch((error) => {
        console.error(error)
      })
}

module.exports = sendMail