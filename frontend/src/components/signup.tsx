import { Link } from 'react-router-dom'
import { useState } from 'react';

function SignUp() {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(null);

    const [error, setError] = useState(null);

    const base_url = "https://resumereaper.com"

    async function tryRegister(e: React.SubmitEvent): Promise<string | null> {
        e.preventDefault();

        const resp = await fetch(base_url + '/api/auth/register', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
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
        setSuccess(user.message)
        return null;
    }

    return (
        <div className="flex bg-[#232323] text-white h-full w-full shadow-lg justify-center items-center tracking-wide">
            <div className="w-[80%]">
                <p className="text-[#8B0000] text-md">Welcome</p>
                <p className="text-lg ">Sign Up</p>
                <hr className="text-[#8B0000] mt-4 w-[55%]" />
                <form className="mt-10" onSubmit={tryRegister}>
                    <label htmlFor="firstName" className="text-sm">First Name </label><br />
                    <input className="mt-5 bg-white text-black pt-2 pb-2 pl-2 mb-5 w-full border rounded-sm" type="text" id="firstName" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)}></input>

                    <label htmlFor="lastName" className="text-sm">Last Name </label><br />
                    <input className="mt-5 mb-3 bg-white text-black pt-2 pb-2 pl-2 w-full border rounded-sm" type="text" id="lastName" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)}></input> <br />

                    <label htmlFor="email" className="text-sm">Email </label><br />
                    <input className="mt-5 bg-white text-black pt-2 pb-2 pl-2 mb-5 w-full border rounded-sm" type="text" id="email" placeholder="Example@example.com" value={email} onChange={e => setEmail(e.target.value)}></input>

                    <label htmlFor="password" className="text-sm">Password </label><br />
                    <input className="mt-5 bg-white text-black pt-2 pb-2 pl-2 w-full border rounded-sm" type="password" id="password" placeholder="************" value={password} onChange={e => setPassword(e.target.value)}></input> <br />

                    {error && (
                        <p className='text-[#8B0000] mt-4'>{error}</p>
                    )}

                    {success && (
                        <p className='text-blue-300 mt-4'>{success}</p>
                    )}

                    <input type="submit" className="mt-12 bg-[#8B0000] w-full p-1 border-black rounded-lg shadow-sm" />
                </form>
                <Link to="/" className="text-sm mt-3 text-gray-300 hover:text-gray-100">Already have an account? Sign In</Link>
            </div>
        </div>
    );
}

export default SignUp;