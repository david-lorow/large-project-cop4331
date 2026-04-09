import { Link } from 'react-router-dom'
import { useState } from 'react';

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const base_url = "http://resumereaper.com"

    async function tryLogin(e: React.SubmitEvent): Promise<string | null> {
        e.preventDefault()

        const resp = await fetch(base_url + '/api/auth/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })

        if (!resp.ok) {
            const message = await resp.json()
            setError(message.message)
            console.log(message.message)
            return null;
        }

        const user = await resp.json()
        console.log(user)
        return null;
    }

    return (
        <div className="flex bg-[#232323] text-white h-full w-full shadow-lg justify-center items-center tracking-wide">
            <div className="w-[80%]">
                <p className="text-[#8B0000] text-md">Welcome Back</p>
                <p className="text-lg ">Sign In</p>
                <hr className="text-[#8B0000] mt-4 w-[55%]" />
                <form className="mt-10" onSubmit={tryLogin}>
                    <label htmlFor="email" className="text-sm">Email </label><br />
                    <input className="mt-5 bg-white text-black pt-2 pb-2 pl-2 mb-8 w-full border rounded-sm" type="text" id="email" placeholder="Example@example.com" value={email} onChange={e => setEmail(e.target.value)}></input>

                    <label htmlFor="password" className="text-sm">Password </label><br />
                    <input className="mt-5 bg-white text-black pt-2 pb-2 pl-2 w-full border rounded-sm" type="password" id="password" placeholder="************" value={password} onChange={e => setPassword(e.target.value)}></input> <br />

                    {error && (
                        <p className='text-[#8B0000] mt-4'>{error}</p>
                    )}

                    <input type="submit" className="mt-12 bg-[#8B0000] w-full p-1 border-black rounded-lg shadow-sm" />
                </form>
                <Link to="/signup" className="text-sm mt-3 text-gray-300 hover:text-gray-100">Don't have an account? Sign Up</Link>
            </div>
        </div>
    );
}

export default Login;