import LoginPage from './pages/loginPage'
import SignUpPage from './pages/signupPage'
import { Routes, Route } from 'react-router-dom'

function App() {


  return (


    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  )
}

export default App
