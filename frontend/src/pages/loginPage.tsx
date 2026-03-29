import Login from '../components/login'
import LogoPane from '../components/logoPane';

const LoginPage = () => {
    return (
        <div className='flex min-w-screen min-h-screen min-w-96'>
            <div className='w-7/12 '>
                <LogoPane />
            </div>
            <div className='w-5/12'>
                <Login />
            </div>
        </div>
    );
}

export default LoginPage;