'use client'

import * as React from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import { DriveErrorType } from '@/types/drive'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

interface FormState {
  email: string
  password: string
  orgName: string
  firstName: string
  lastName: string
}

interface ApiError {
  code: string
  message: string
  longMessage: string
  meta: Record<string, unknown>
}

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  
  // Form state
  const [formState, setFormState] = React.useState<FormState>({
    email: '',
    password: '',
    orgName: '',
    firstName: '',
    lastName: '',
  })
  
  // UI state
  const [verifying, setVerifying] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [errors, setErrors] = React.useState<ApiError[]>()
  const [isLoading, setIsLoading] = React.useState(false)

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  // Handle submission of the sign-up form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors(undefined)

    if (!isLoaded) {
      setIsLoading(false)
      return
    }

    try {
      // Create folders via server API route
      const folderResponse = await fetch('/api/createFolders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgName: formState.orgName,
          orgEmail: formState.email,
        }),
      });

      const data = await folderResponse.json();

      if (!folderResponse.ok) {
        throw {
          code: 'folder_creation_failed',
          message: data.error || 'Failed to create organization folders',
          longMessage: data.details?.message || 'Unable to create the necessary folders for your organization. Please try again.',
          meta: {
            type: data.type || DriveErrorType.FOLDER_ERROR,
            ...data.details
          }
        };
      }

      const { unlistedId, publicId } = data;

      // Create the Clerk user with the folder IDs
      const signUpAttempt = await signUp.create({
        emailAddress: formState.email,
        password: formState.password,
        firstName: formState.firstName,
        lastName: formState.lastName,
        unsafeMetadata: {
          org_name: formState.orgName,
          permission: "admin",
          unlistedId,
          publicId,
          orgId: unlistedId,
          userId: publicId,
          superuser: false
        }
      });

      if (signUpAttempt.status !== 'complete') {
        await signUpAttempt.prepareEmailAddressVerification({
          strategy: 'email_code'
        });
        setVerifying(true);
      }

    } catch (err) {
      console.error('Signup error:', err);
      if (isClerkAPIResponseError(err)) {
        // Map Clerk errors to our ApiError format
        setErrors(err.errors.map(clerkError => ({
          code: clerkError.code,
          message: clerkError.message,
          longMessage: clerkError.longMessage || clerkError.message, // Ensure longMessage is always present
          meta: clerkError.meta || {}
        })));
      } else if (err && typeof err === 'object' && 'code' in err) {
        // Handle our API errors (like folder creation errors)
        setErrors([err as ApiError]);
      } else {
        // Handle unexpected errors
        setErrors([{
          code: 'unexpected_error',
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
          longMessage: err instanceof Error ? err.message : 'An unexpected error occurred during signup. Please try again.',
          meta: {}
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the verification code submission
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!isLoaded) {
      setIsLoading(false)
      return
    }

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code
      });

      if (signUpAttempt.status === 'complete') {
        // Send welcome email
        const emailResponse = await fetch('/api/sendEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formState.email,
            firstName: formState.firstName,
            lastName: formState.lastName,
            orgName: formState.orgName
          })
        });

        const emailData = await emailResponse.json();
        
        if (!emailResponse.ok) {
          setErrors([{
            code: 'email_error',
            message: 'Welcome email failed to send',
            longMessage: 'Your account was created successfully, but we encountered an issue sending the welcome email. You can still proceed to use the platform.',
            meta: emailData
          }]);
        }

        // Set active session and redirect regardless of email status
        await setActive({ session: signUpAttempt.createdSessionId })
        router.push('/')
      }
    } catch (err) {
      console.error('Verification error:', err);
      if (isClerkAPIResponseError(err)) {
        // Map Clerk errors to our ApiError format
        setErrors(err.errors.map(clerkError => ({
          code: clerkError.code,
          message: clerkError.message,
          longMessage: clerkError.longMessage || clerkError.message,
          meta: clerkError.meta || {}
        })));
      } else {
        // Handle unexpected errors
        setErrors([{
          code: 'verification_error',
          message: err instanceof Error ? err.message : 'Verification failed',
          longMessage: err instanceof Error ? err.message : 'Failed to verify your email. Please try again.',
          meta: {}
        }]);
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Verification form
  if (verifying) {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Verify your email</h1>
        <form onSubmit={handleVerify} className="w-full max-w-md p-6 border rounded-lg">
          <label className="block mb-2" htmlFor="code">
            Enter verification code
          </label>
          <input
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-full mt-4 p-2 bg-blue-500 text-black rounded disabled:bg-gray-300"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
          {errors && (
            <div className="mt-4 p-4 bg-red-100 rounded">
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700">
                    {error.longMessage}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    )
  }

  // Sign-up form
  return (
    <>
      <Header />
      <div className="container mx-auto my-12 px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Sign up</h1>
        <h2 className="text-lg font-semibold mb-4">Here&apos;s the problem:</h2>
        <p className="mb-4">Big orgs suck the air out of the room. Some are great. Some are not.</p>
        <p className="mb-4">Most of them prevent resources from flowing to smaller orgs who all too often are far too busy making an impact to crow about it.</p>
        <p className="mb-4">We&apos;re here to help.</p>
        <br/>
        <h2 className="text-lg font-semibold mb-4">Here&apos;s our solution:</h2>
        <p className="mb-4">We take your submitted raw video and produce web content that&apos;s polished and ready for sharing across channels to amplify your voice.</p>
        <p className="mb-4">That&apos;s where we&apos;re starting. And it&apos;s free. Completely.</p>
        <br/>
        <p className="mb-4">Over time, we hope to do more. <br/><strong>MUCH more.</strong></p>
        <p className="mb-4">We plan to build networks to help you collaborate to make broader impacts.<br/><br/> Social funding networks to help you impact deeper.<br/><br/> And sharing networks to help you brag about it all, everywhere that matters.</p>
        <br/>
        <h2 className="text-lg font-semibold mb-4">Ready to level up your organization? <br/><br/>Fill out the form to get started. Together, we can do anything. Let&apos;s go do THIS thing, and let&apos;s do it now.</h2>
        {/* link to email david@windroseandco.com */}
        <p className="mb-4"><Link href="mailto:david@windroseandco.com">- David Rodriguez, WGISTL</Link></p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label className="block mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formState.firstName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formState.lastName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formState.password}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2" htmlFor="orgName">
              Organization Name
            </label>
            <input
              id="orgName"
              name="orgName"
              type="text"
              value={formState.orgName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-2 bg-black b-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        
        {errors && (
          <div className="mt-4 p-4 bg-red-100 rounded max-w-md mx-auto">
            <ul>
              {errors.map((error, index) => (
                <li key={index} className="text-red-700">
                  {error.longMessage}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}