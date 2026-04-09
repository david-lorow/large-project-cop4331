import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/client'

type Status = 'loading' | 'success' | 'error'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No verification token found in the link.')
      return
    }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed.')
      })
  }, [])

  return (
    <div>
      {status === 'loading' && <p>Verifying your email…</p>}

      {status === 'success' && (
        <div>
          <p>Email verified! You can now sign in.</p>
          <a href="/">Sign In</a>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p>{message || 'This link is invalid or has expired.'}</p>
          <a href="/signup">Back to Sign Up</a>
        </div>
      )}
    </div>
  )
}

export default VerifyEmailPage