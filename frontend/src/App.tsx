import LoginPage from './pages/loginPage'
import SignUpPage from './pages/signupPage'
import HomePage from './pages/homePage'
import ResumeViewPage from './pages/resumeViewPage'
import VerifyEmailPage from './pages/verifyEmailPage'
import AboutUsPage from './pages/aboutUsPage'
import AIReviewPage from './pages/aiReviewPage'
import ForgotPasswordPage from './pages/forgotPasswordPage'
import ResetPasswordPage from './pages/resetPasswordPage'
import { Routes, Route } from 'react-router-dom'

function App() {


  return (


    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/resume/:id" element={<ResumeViewPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/ai" element={<AIReviewPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  )
}

export default App
