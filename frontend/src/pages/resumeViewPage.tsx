import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResume } from '../api/client';
import type { Resume } from '../api/client';
import ApplicationPill from '../components/applicationPill';
import Navbar from '../components/navBar';

const ResumeViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [resume, setResume] = useState<Resume | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock applications — wiring to real API is a future task
    const [applications, _setApplications] = useState([
        { id: 1, company: 'Lockheed', position: 'Software Engineer', status: 'Ghosted', date: '04/06/2026' }
    ]);

    useEffect(() => {
        if (!id) return;
        getResume(id)
            .then(({ resume, downloadUrl }) => {
                setResume(resume);
                setDownloadUrl(downloadUrl);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handlePrint = () => {
        if (!downloadUrl) return;
        const w = window.open(downloadUrl, '_blank');
        if (w) w.addEventListener('load', () => w.print());
    };

    return (
        <div className="flex flex-col h-screen bg-[#1a1a1a] text-white overflow-hidden">
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Left: PDF viewer */}
                <div className="w-5/12 bg-black flex flex-col items-center p-10 border-r border-black shrink-0">
                    <div className="flex items-center justify-between w-[85%] mb-4">
                        <h2 className="text-2xl font-normal truncate">
                            {loading ? 'Loading...' : (resume?.title ?? 'Resume')}
                        </h2>
                        <button
                            onClick={handlePrint}
                            disabled={!downloadUrl}
                            className="ml-4 px-4 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-40"
                        >
                            Print
                        </button>
                    </div>

                    <div className="w-[85%] flex-1 shadow-2xl overflow-hidden">
                        {downloadUrl ? (
                            <iframe
                                src={downloadUrl}
                                className="w-full h-full"
                                title="Resume PDF"
                            />
                        ) : (
                            <div className="w-full h-full bg-white flex items-center justify-center text-gray-400">
                                {loading ? 'Loading PDF...' : 'PDF unavailable'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Applications */}
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
                                <div>Position</div>
                                <div>Status</div>
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
                            <option>Ghosted</option>
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
};

export default ResumeViewPage;
