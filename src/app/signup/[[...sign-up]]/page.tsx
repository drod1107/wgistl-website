'use client'

import * as React from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { ClerkAPIError } from '@clerk/types'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'

interface FormState {
  email: string
  password: string
  orgName: string
  firstName: string
  lastName: string
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
  const [errors, setErrors] = React.useState<ClerkAPIError[]>()
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
      // Create playlists via server API route
      const playlistResponse = await fetch('/api/create-playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgName: formState.orgName,
        }),
      })

      if (!playlistResponse.ok) {
        throw new Error('Failed to create playlists')
      }

      const { unlistedId, publicId } = await playlistResponse.json()

      // Create the Clerk user with the playlist IDs
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
          userId: publicId
        }
      })

      if (signUpAttempt.status !== 'complete') {
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code'
        })
        setVerifying(true)
      }
    } catch (err: unknown) {
      console.error('Signup error:', err)
      if (isClerkAPIResponseError(err)) {
        setErrors(err.errors)
      } else if (err instanceof Error) {
        setErrors([{
          code: 'signup_error',
          message: err.message,
          longMessage: err.message,
          meta: {}
        }])
      }
    } finally {
      setIsLoading(false)
    }
  }

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
      })

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

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('Failed to send welcome email:', errorData);
          setErrors([{
            code: 'email_error',
            message: 'Account created but welcome email failed to send.',
            longMessage: 'Your account was created successfully, but we encountered an issue sending the welcome email. You can still proceed to use the platform.',
            meta: {}
          }]);
        }

        // Set active session and redirect regardless of email status
        await setActive({ session: signUpAttempt.createdSessionId })
        router.push('/')
      }
    } catch (err: unknown) {
      console.error('Verification error:', err)
      if (isClerkAPIResponseError(err)) {
        setErrors(err.errors)
      } else if (err instanceof Error) {
        setErrors([{
          code: 'verification_error',
          message: err.message,
          longMessage: err.message,
          meta: {}
        }])
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Sign up</h1>
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