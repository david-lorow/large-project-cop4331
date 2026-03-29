import logo from '../assets/logo.png'

function LogoPane() {
    return (
        <div className="flex bg-black h-full justify-center items-center align-center shadow-lg">
            <div className=''>
                <img src={logo}></img>
                <h1 className='text-white tracking-wide flex justify-center text-7xl'>Resume</h1>
                <h1 className='text-[#8B0000] tracking-wide flex justify-center text-7xl'>Reaper</h1>
            </div>
        </div>
    );
}

export default LogoPane;