'use client'

import * as React from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { ClerkAPIError } from '@clerk/types'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import { createPlaylist } from '@/app/api/createList/route'

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [orgName, setOrgName] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [unlisted_id, setUnlistedId] = React.useState('')
  const [public_id, setPublicId] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [code, setCode] = React.useState('')
  const router = useRouter()
  const [errors, setErrors] = React.useState<ClerkAPIError[]>()


  // Handle submission of the sign-up form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // clear any errors that may have occurred during previous form submission
    setErrors(undefined)

    if (!isLoaded) return

    // Start the sign-up process using the email and password provided
    try {
      const unlisted_id =
        await createPlaylist(`${orgName} - raw content and uploads`, 'Raw content and uploaded footage for use in WGISTL projects', 'unlisted');
      setUnlistedId(unlisted_id);
      const public_id =
        await createPlaylist(`${orgName}`, `WGISTL project for all things ${orgName}`, 'public');
      setPublicId(public_id);
      const emailAddress = email;
      const signUpAttempt =
        await signUp.create({
          emailAddress,
          password
        })

      if (signUpAttempt.status !== 'complete') {
        console.log(JSON.stringify(signUpAttempt, null, 2))
      }

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code'
      })

      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true)
      return {
        email: signUpAttempt.emailAddress,
        public_id: public_id,
        unlisted_id: unlisted_id
      };
    } catch (err: Error | any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (isClerkAPIResponseError(err)) {
        setErrors(err.errors)
      }
      console.error(JSON.stringify(err, null, 2))
      console.log(err.errors[0].longMessage);
    }
  }

  // Handle the submission of the verification form
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        try {
          await fetch('/api/sendEmail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              firstName,
              lastName,
              orgName,
              public_id,
              unlisted_id
            })
          })
          await setActive({ session: signUpAttempt.createdSessionId })
          router.push('/')
        } catch (err: Error | any) {
          // See https://clerk.com/docs/custom-flows/error-handling
          // for more info on error handling
          console.error('Error:', JSON.stringify(err, null, 2))
        }
      }
    } catch (err: Error |any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (isClerkAPIResponseError(err)) {
        setErrors(err.errors)
      }
      console.error('Error:', JSON.stringify(err, null, 2))
    }
  }


  // Display the verification form to capture the OTP code
  if (verifying) {
    return (
      <>
        <h1>Verify your email</h1>
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid black', padding: '1rem', margin: '0.5rem 0' }}>
          <label id="code">Enter your verification code</label>
          <input value={code} className='border-solid border-2' id="code" name="code" onChange={(e) => setCode(e.target.value)} />
          <button type="submit">Verify</button>
        </form>
      </>
    )
  }

  // Display the initial sign-up form to capture the email and password
  return (
    <>
      <Header />
      <style>{`
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0.5rem 0;
          border: 1px solid black;
          padding: 1rem;
        }
        div {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0.5rem 0;
        }
        label {
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        input {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
      `}</style>
      <h1>Sign up</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label htmlFor="firstName">Enter your first name</label>
            <input
              id="firstName"
              type="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="lastName">Enter your last name</label>
            <input
              id="lastName"
              type="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <label htmlFor="email">Enter email address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Enter password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="orgName">Enter the name of your organization/NPO</label>
          <input
            id="orgName"
            type="orgName"
            name="orgName"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </div>
        <div>
          <button type="submit">Continue</button>
        </div>
      </form>
      {errors && (
        <ul>
          {errors.map((el, index) => (
            <li key={index}>{el.longMessage}</li>
          ))}
        </ul>
      )}
    </>
  )
}

