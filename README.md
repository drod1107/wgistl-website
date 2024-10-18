# WGISTL - What's Good in St. Louis? Website

## Getting Started

1. Environment Setup:
   - Install necessary dependencies: `npm install nodemailer`.
   - Install Tailwind CSS: Follow <https://tailwindcss.com/docs/guides/nextjs>.
   - Set up environment variables for SendGrid credentials in a `.env.local` file:
     SENDGRID_USER=your-sendgrid-username
     SENDGRID_PASS=your-sendgrid-password

2. Create a SendGrid Account:
   - Go to <https://sendgrid.com/> and sign up for an account.
   - Once registered, create an API key that will be used as your password.
   - Set the SENDGRID_USER as 'apikey' and SENDGRID_PASS as your generated API key.

3. Domain Deployment:
   - Deploy the website on Vercel: `npx vercel` (ensure your domain on Namecheap is pointed to Vercel).
   - Add the domain in the Vercel project settings to connect it to your Namecheap domain.

4. Video File:
   - Add your background video file in the `public` folder as `video.mp4`.

Notes:

- This basic setup allows for easy extensibility by adding future components such as authentication and a login system.
- Tailwind CSS is used for rapid styling and maintaining a consistent design.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
