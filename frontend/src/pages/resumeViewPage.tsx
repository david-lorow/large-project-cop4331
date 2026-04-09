import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationPill from '../components/applicationPill';
import Navbar from '../components/navBar'; 

const ResumeDetailsPage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock Data
    const resumeName = "Resume Name"; 
    const [applications, setApplications] = useState([
        { id: 1, company: 'Lockheed', status: 'Purgatory', date: '04/06/2026' }
    ]);

    return (
        <div className="flex flex-col h-screen bg-[#1a1a1a] text-white overflow-hidden">
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                <div className="w-5/12 bg-black flex flex-col items-center justify-center p-10 border-r border-black shrink-0 relative">
                    
                    <h2 className="text-2xl mb-6 font-normal">{resumeName}</h2>
                    
                    <div className="w-[85%] aspect-[1/1.4] bg-white shadow-2xl overflow-hidden">
                        <img 
                            src="https://via.placeholder.com/600x800?text=John+Smith+Resume" 
                            alt="Resume Preview" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="w-7/12 p-8 overflow-y-auto bg-[#1a1a1a]">
                    <div className="max-w-3xl mx-auto">
                        
                        <button onClick={() => navigate('/home')} className="mt-1 mb-12 text-3xl hover:text-gray-400 transition-colors cursor-pointer flex items-center">←</button>

                        <div className="bg-[#8B0000] rounded-t-2xl p-4 flex justify-between items-center shadow-lg">
                            <h2 className="text-3xl font-normal ml-4">Applications</h2>
                            <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-6 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all mr-4 cursor-pointer">Add</button>
                        </div>

                        <div className="bg-[#232323] rounded-b-2xl p-6 min-h-[400px] shadow-2xl border-t border-black/20">
                            <div className="grid grid-cols-4 text-center text-sm mb-4 text-gray-300 font-light tracking-wide">
                                <div>Company</div>
                                <div>Status</div>
                                <div>Reply</div>
                                <div>Date Applied</div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {applications.map((app) => (
                                    <ApplicationPill key={app.id} app={app} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#232323] p-8 rounded-2xl w-[380px] border border-[#8B0000]">
                        <h3 className="text-xl mb-6 font-normal">New Application</h3>
                        <input className="w-full p-2 mb-4 bg-white text-black rounded outline-none" placeholder="Company" />
                        <select className="w-full p-2 mb-6 bg-white text-black rounded outline-none">
                            <option>Purgatory</option>
                            <option>Interview</option>
                            <option>Denied</option>
                        </select>
                        <div className="flex gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 cursor-pointer">Cancel</button>
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-[#8B0000] py-2 rounded-lg hover:bg-red-700 cursor-pointer">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResumeDetailsPage;