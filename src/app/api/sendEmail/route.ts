// app/api/sendEmail/route.ts
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { createLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const logger = createLogger('SendEmailAPI');

interface EmailPayload {
  firstName: string;
  lastName: string;
  orgName: string;
  email: string;
}

export async function POST(req: Request) {
  try {
    // Extracting form data from the request body
    const { firstName, lastName, orgName, email }: EmailPayload = await req.json();

    // Log email attempt
    logger.info('Attempting to send welcome emails', {
      recipient: email,
      organization: orgName
    });

    // Configuring the nodemailer transporter with SendGrid credentials
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey", // SendGrid requires this as the user value
        pass: process.env.SENDGRID_PASS, // Environment variable for SendGrid API key
      },
    });

    // Setting up email options for the admin notification
    const adminEmail = {
      from: "admin@wgistl.com",
      to: "admin@wgistl.com",
      subject: "New Sign Up for WGISTL",
      text: `First Name: ${firstName}\nLast Name: ${lastName}\nOrganization Name: ${orgName}\nEmail Address: ${email}`,
    };

    // Setting up email options for the welcome email
    const welcomeEmail = {
      from: "admin@wgistl.com",
      to: email,
      subject: "Welcome to WGISTL",
      text: `Hello, ${firstName}!\nWe're excited to welcome you and ${orgName} to WGISTL!\nYou should be able to log in and begin uploading raw content. We will begin processing and producing assets for you within 7 calendar days. Please remember to include relevant details in your uploads to ensure we can tag and share your content and help you boost your impact!\n LET'S GO!!!\n David Rodriguez\nWGISTL\n Windrose & Company, LLC`,
    };

    // Send both emails
    const [adminResult, welcomeResult] = await Promise.all([
      transporter.sendMail(adminEmail),
      transporter.sendMail(welcomeEmail)
    ]);

    logger.info('Emails sent successfully', {
      adminMessageId: adminResult.messageId,
      welcomeMessageId: welcomeResult.messageId
    });

    return NextResponse.json(
      { message: "Emails sent successfully" },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error sending emails:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : 'Unknown error'
    });

    return NextResponse.json(
      { error: `Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
