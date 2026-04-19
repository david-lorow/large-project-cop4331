import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { resetPassword } from '../api/client';
import LogoPane from '../components/logoPane';

function ResetPasswordForm() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/'), 2500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        }
    }

    if (!token) {
        return (
            <div className="flex bg-[#232323] text-white h-full w-full shadow-lg justify-center items-center tracking-wide">
                <div className="w-[80%]">
                    <p className="text-[#8B0000]">Invalid reset link.</p>
                    <Link to="/forgot-password" className="block mt-4 text-sm text-gray-400 hover:text-gray-200">
                        Request a new one
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#232323] text-white h-full w-full shadow-lg justify-center items-center tracking-wide">
            <div className="w-[80%]">
                <p className="text-[#8B0000] text-md">Account Recovery</p>
                <p className="text-lg">Reset Password</p>
                <hr className="text-[#8B0000] mt-4 w-[55%]" />

                {success ? (
                    <div className="mt-10">
                        <p className="text-gray-300 text-sm">Password updated. Redirecting to sign in...</p>
                    </div>
                ) : (
                    <form className="mt-10" onSubmit={handleSubmit}>
                        <label htmlFor="password" className="text-sm">New Password</label><br />
                        <input
                            className="mt-5 bg-white text-black pt-2 pb-2 pl-2 mb-8 w-full border rounded-sm"
                            type="password"
                            id="password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        <label htmlFor="confirm" className="text-sm">Confirm Password</label><br />
                        <input
                            className="mt-5 bg-white text-black pt-2 pb-2 pl-2 w-full border rounded-sm"
                            type="password"
                            id="confirm"
                            placeholder="Repeat your password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                        />

                        {error && <p className="text-[#8B0000] mt-4">{error}</p>}

                        <input
                            type="submit"
                            value="Reset Password"
                            className="mt-12 bg-[#8B0000] w-full p-1 border-black rounded-lg shadow-sm cursor-pointer"
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

const ResetPasswordPage = () => {
    return (
        <div className="flex min-w-screen min-h-screen min-w-96">
            <div className="w-7/12">
                <LogoPane />
            </div>
            <div className="w-5/12">
                <ResetPasswordForm />
            </div>
        </div>
    );
};

export default ResetPasswordPage;
