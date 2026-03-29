import { Link } from 'react-router-dom'

function SignUp() {
    return (
        <div className="flex bg-[#232323] text-white h-full w-full shadow-lg justify-center items-center tracking-wide">
            <div className="w-[80%]">
                <p className="text-[#8B0000] text-md">Welcome Back</p>
                <p className="text-lg ">Sign In</p>
                <hr className="text-[#8B0000] mt-4 w-[55%]" />
                <form className="mt-10">
                    <label htmlFor="email" className="text-sm">Email </label><br />
                    <input className="mt-5 bg-white text-black pt-2 pb-2 pl-2 mb-8 w-full border rounded-sm" type="text" id="email" placeholder="Example@example.com"></input>

                    <label htmlFor="password" className="text-sm">Password </label><br />
                    <input className="mt-5 bg-white text-black pt-2 pb-2 pl-2 w-full border rounded-sm" type="password" id="password" placeholder="************"></input> <br />

                    <input type="submit" className="mt-24 bg-[#8B0000] w-full p-1 border-black rounded-lg shadow-sm" />
                </form>
                <Link to="/" className="text-sm mt-3 text-gray-300 hover:text-gray-100">Already have an account? Sign In</Link>
            </div>
        </div>
    );
}

export default SignUp;