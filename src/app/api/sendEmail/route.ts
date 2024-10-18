// app/api/sendEmail/route.ts

// Importing nodemailer to send emails and Next.js utility for responses
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// Handler for POST requests to send an email
export async function POST(req: Request) {
  try {
    // Extracting form data from the request body
    const { firstName, lastName, orgName, email } = await req.json();

    // Configuring the nodemailer transporter with SendGrid credentials for secure email sending
    const transporter = nodemailer.createTransport({
      service: 'SendGrid', // Using SendGrid for better scalability and security
      auth: {
        user: 'apikey', // SendGrid requires this as the user value
        pass: process.env.SENDGRID_PASS, // Environment variable for SendGrid API key
      },
    });

    // Setting up email options for the email to be sent
    const mailOptions = {
      from: 'admin@wgistl.com', // Sender's email address (use a no-reply address to prevent direct responses)
      to: 'admin@wgistl.com', // Recipient email address
      subject: 'New Sign Up for WGISTL', // Subject of the email
      text: `First Name: ${firstName}\nLast Name: ${lastName}\nOrganization Name: ${orgName}\nEmail Address: ${email}`, // Content of the email
    };

    // Attempting to send the email using the transporter
    await transporter.sendMail(mailOptions); // Send email

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 }); // Return success response
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: `Error sending email: ${error}` }, { status: 500 }); // Return error response if email fails
  }
}
