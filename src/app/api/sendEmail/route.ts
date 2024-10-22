// app/api/sendEmail/route.ts

// Importing nodemailer to send emails and Next.js utility for responses
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { createPlaylist } from '../createList/route';

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
    const adminEmail = {
      from: 'admin@wgistl.com', // Sender's email address (use a no-reply address to prevent direct responses)
      to: 'admin@wgistl.com', // Recipient email address
      subject: 'New Sign Up for WGISTL', // Subject of the email
      text: `First Name: ${firstName}\nLast Name: ${lastName}\nOrganization Name: ${orgName}\nEmail Address: ${email}`, // Content of the email
    };

    const welcomeEmail = {
      from: 'admin@wgistl.com', // Sender's email address (use a no-reply address to prevent direct responses)
      to: email, // Recipient email address
      subject: 'Welcome to WGISTL', // Subject of the email
      text: `Hello, ${firstName}!\nWe're excited to welcome you and ${orgName} to WGISTL!\nYou should be able to log in and begin uploading raw content. We will begin processing and producing assets for you within 7 calendar days. Please remember to include relevant details in your uploads to ensure we can tag and share your content and help you boost your impact!\n LET'S GO!!!\n David Rodriguez\nWGISTL\n Windrose & Company, LLC`, // Content of the email
    };

    // Attempting to send the email using the transporter
    await transporter.sendMail(adminEmail); // Send email
    await transporter.sendMail(welcomeEmail); // Send email
    await createPlaylist(orgName, `${orgName} playlist for uploading content to WGISTL`, 'unlisted').then((response)=> {
        return NextResponse.json({ message: 'Email sent successfully', response }, { status: 200 }); // Return success response
      }); // Call the createPlaylist function to create a playlist
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: `Error sending email: ${error}` }, { status: 500 }); // Return error response if email fails
  }
  }

