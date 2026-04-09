import LoginPage from './pages/loginPage'
import SignUpPage from './pages/signupPage'
import HomePage from './pages/homePage'
import ResumeViewPage from './pages/resumeViewPage'
import VerifyEmailPage from './pages/verifyEmailPage'
import { Routes, Route } from 'react-router-dom'

function App() {


  return (


    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/resume/:id" element={<ResumeViewPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
    </Routes>
  )
}

export default App
