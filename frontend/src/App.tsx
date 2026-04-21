import React from 'react'
import LoginPage from './pages/loginPage'
import SignUpPage from './pages/signupPage'
import HomePage from './pages/homePage'
import ResumeViewPage from './pages/resumeViewPage'
import VerifyEmailPage from './pages/verifyEmailPage'
import AboutUsPage from './pages/aboutUsPage'
import AIReviewPage from './pages/aiReviewPage'
import ForgotPasswordPage from './pages/forgotPasswordPage'
import ResetPasswordPage from './pages/resetPasswordPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from './api/client'

function PrivateRoute({ element }: { element: React.ReactElement }) {
  return getToken() ? element : <Navigate to="/" replace />
}

function App() {


  return (


    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
      <Route path="/resume/:id" element={<PrivateRoute element={<ResumeViewPage />} />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/ai" element={<PrivateRoute element={<AIReviewPage />} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  )
}

export default App
