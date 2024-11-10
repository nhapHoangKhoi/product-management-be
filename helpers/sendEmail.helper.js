const nodemailer = require('nodemailer');

module.exports.sendEmail = (destinationEmail, subject, content) =>
{
   const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.EMAIL_SOURCE,
         pass: process.env.PASSWORD_APP
      }
   });

   const mailOptions = {
      from: "nhaphk@gmail.com",
      to: destinationEmail,
      subject: subject,
      html: content
   };

   // send the email
   transporter.sendMail(mailOptions, function(error, info){
      if (error) {
         console.log('Error:', error);
      } else {
         console.log('Email sent: ', info.response);
      }
   });
}