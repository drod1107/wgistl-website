// app/signup/page.tsx
// Importing React hooks for managing state
'use client';

import { useState } from 'react';

// Defining the structure of the form data using TypeScript interface
interface FormData {
  firstName: string;
  lastName: string;
  orgName: string;
  email: string;
}

// Signup component definition
export default function Signup() {
  // useState hook to manage form data, initially empty
  const [formData, setFormData] = useState<FormData>({ firstName: '', lastName: '', orgName: '', email: '' });

  // Handler to manage changes in form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Updating the specific field in form data
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents the default form submission behavior
    const { firstName, lastName, orgName, email } = formData; // Destructuring form data

    // Sending form data to the server-side API to send an email
    const response = await fetch('/api/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Setting the content type of the request
      },
      body: JSON.stringify({ firstName, lastName, orgName, email }), // Converting form data to JSON for the request body
    });

    // Handling response from the API
    if (response.ok) {
      alert('Sign up form submitted successfully!');
    } else {
      alert('There was an error submitting the form.');
    }
  };

  return (
    // Main container for the signup form, using Tailwind for styling
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center font-oswald text-hero">Sign Up to Join WGISTL</h2>
        {/* Signup form with controlled inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="p-3 border rounded font-montserrat" />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="p-3 border rounded font-montserrat" />
          <input type="text" name="orgName" placeholder="Organization Name" value={formData.orgName} onChange={handleChange} required className="p-3 border rounded font-montserrat" />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="p-3 border rounded font-montserrat" />
          <button type="submit" className="bg-hero text-white py-3 rounded mt-4 font-montserrat">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
