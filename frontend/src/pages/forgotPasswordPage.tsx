import { Link } from 'react-router-dom';
import { useState } from 'react';
import { forgotPassword } from '../api/client';
import LogoPane from '../components/logoPane';

function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await forgotPassword(email);
            setSubmitted(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        }
    }

    return (
        <div className="flex bg-[#232323] text-white h-full w-full shadow-lg justify-center items-center tracking-wide">
            <div className="w-[80%]">
                <p className="text-[#8B0000] text-md">Account Recovery</p>
                <p className="text-lg">Forgot Password</p>
                <hr className="text-[#8B0000] mt-4 w-[55%]" />

                {submitted ? (
                    <div className="mt-10">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            If that email is registered, you'll receive a password reset link shortly. Check your inbox.
                        </p>
                        <Link to="/" className="block mt-6 text-sm text-gray-400 hover:text-gray-200">
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <form className="mt-10" onSubmit={handleSubmit}>
                        <label htmlFor="email" className="text-sm">Email</label><br />
                        <input
                            className="mt-5 bg-white text-black pt-2 pb-2 pl-2 mb-8 w-full border rounded-sm"
                            type="email"
                            id="email"
                            placeholder="Example@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />

                        {error && <p className="text-[#8B0000] mb-4">{error}</p>}

                        <input
                            type="submit"
                            value="Send Reset Link"
                            className="bg-[#8B0000] w-full p-1 border-black rounded-lg shadow-sm cursor-pointer"
                        />
                        <Link to="/" className="block mt-4 text-sm text-gray-400 hover:text-gray-200">
                            Back to Sign In
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}

const ForgotPasswordPage = () => {
    return (
        <div className="flex min-w-screen min-h-screen min-w-96">
            <div className="w-7/12">
                <LogoPane />
            </div>
            <div className="w-5/12">
                <ForgotPasswordForm />
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
