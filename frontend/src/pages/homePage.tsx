import { useState } from 'react';
import ResumeCard from '../components/resumeCard';
import Navbar from '../components/navBar';

const HomePage = () => {
    // Sample user data - when implemented, will fetch this from your Auth context/state
    const [userName] = useState("Alex"); 
    
    // Mock resume data for testing - in a real app, this would come from an API call
    const [resumes] = useState([
        { id: '1', name: 'Software Engineer 2026', date: 'April 8, 2026' },
        { id: '2', name: 'Product Manager Role', date: 'March 15, 2026' },
        { id: '3', name: 'Creative Director', date: 'Feb 10, 2026' },
    ]);

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <Navbar />

            <main className="flex flex-col items-center pt-16 px-6">
                <h1 className="text-4xl font-medium mb-8">{userName}'s Resume Portfolio</h1>

                <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all mb-16 cursor-pointer">
                    <span className="text-xl">+</span>
                    Upload Resume
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl pb-20">
                    {resumes.map((resume) => (
                        <ResumeCard 
                            key={resume.id}
                            name={resume.name}
                            date={resume.date}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HomePage;