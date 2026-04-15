import { Link } from 'react-router-dom';

const Navbar = () => {
    const handleLogout = () => {
        console.log("User logged out");
    };

    return (
        <nav className="flex justify-between items-center px-10 py-3 bg-[#232323] border-b border-black shrink-0 w-full z-10">

            <Link to="/home" className="flex flex-col select-none hover:opacity-80 transition-opacity decoration-none">
                <span className="text-2xl font-normal text-white leading-tight tracking-tight">Resume</span>
                <span className="text-2xl font-normal text-[#8B0000] leading-none tracking-tight">Reaper</span>
            </Link>

            <div className="flex items-center gap-12">
                <Link to="/ai" className="text-xl text-white font-light hover:text-gray-400 transition-colors">AI Review</Link>
                <Link to="/about" className="text-xl text-white font-light hover:text-gray-400 transition-colors">About Us</Link>
                <button onClick={handleLogout} className="text-xl text-white font-light hover:text-gray-400 transition-colors cursor-pointer bg-transparent border-none p-0">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;