import SignUp from '../components/signup'
import LogoPane from '../components/logoPane';

const SignUpPage = () => {
    return (
        <div className='flex min-w-screen min-h-screen min-w-96'>
            <div className='w-7/12 '>
                <LogoPane />
            </div>
            <div className='w-5/12'>
                <SignUp />
            </div>
        </div>
    );
}

export default SignUpPage;