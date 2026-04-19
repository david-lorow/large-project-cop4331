import { useState, useEffect, useRef } from 'react';
import ResumeCard from '../components/resumeCard';
import Navbar from '../components/navBar';
import { getUser, listResumes, uploadResume, deleteResume, searchResumes, type Resume } from '../api/client';

const HomePage = () => {
    const user = getUser();
    const userName = user ? user.firstName : 'My';

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [uploading, setUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingTitle, setPendingTitle] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Resume[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        listResumes().then(({ resumes }) => setResumes(resumes)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        let cancelled = false;
        searchResumes(searchQuery)
            .then(({ resumes }) => { if (!cancelled) setSearchResults(resumes); })
            .catch(console.error);
        return () => { cancelled = true; };
    }, [searchQuery]);

    const openSearch = () => {
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        setPendingTitle(file.name.replace(/\.pdf$/i, ''));
        e.target.value = '';
    };

    const handleUploadConfirm = async () => {
        if (!pendingFile || !pendingTitle.trim()) return;
        setUploading(true);
        try {
            const { resume } = await uploadResume(pendingFile, pendingTitle.trim());
            setResumes((prev) => [resume, ...prev]);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            setPendingFile(null);
            setPendingTitle('');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteResume(id);
            setResumes((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const displayedResumes = searchQuery.trim() ? searchResults : resumes;

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <Navbar />

            {/* Floating search bar */}
            <div className="fixed top-24 left-10 z-40">
                <div
                    className={`flex items-center bg-[#1a1a1a] border border-gray-700 rounded-full transition-all duration-300 overflow-hidden h-10 ${searchOpen ? 'w-72 shadow-lg shadow-black/50' : 'w-10'}`}
                >
                    <button
                        className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        onClick={openSearch}
                        aria-label="Search resumes"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                    </button>
                    {searchOpen && (
                        <>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search resumes…"
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500 min-w-0"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                            />
                            <button
                                className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-gray-500 hover:text-white transition-colors cursor-pointer"
                                onClick={closeSearch}
                                aria-label="Close search"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <main className="flex flex-col items-center pt-16 px-6">
                <h1 className="text-4xl font-medium mb-8">{userName}'s Resume Portfolio</h1>

                <button
                    className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all mb-16 cursor-pointer disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    <span className="text-xl">+</span>
                    Upload Resume
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelected}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl pb-20">
                    {displayedResumes.length === 0 && searchQuery.trim() ? (
                        <p className="col-span-3 text-center text-gray-500 mt-8">No resumes match "{searchQuery}"</p>
                    ) : (
                        displayedResumes.map((resume) => (
                            <ResumeCard
                                key={resume._id}
                                id={resume._id}
                                name={resume.title}
                                date={formatDate(resume.createdAt)}
                                thumbnailUrl={resume.thumbnailUrl}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </main>

            {pendingFile && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#232323] rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4">
                        <p className="text-lg font-medium">Name this resume</p>
                        <input
                            type="text"
                            className="bg-[#333] text-white px-4 py-2 rounded-lg outline-none border border-gray-600 focus:border-gray-400"
                            value={pendingTitle}
                            onChange={(e) => setPendingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUploadConfirm()}
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                                onClick={() => { setPendingFile(null); setPendingTitle(''); }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-5 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 cursor-pointer disabled:opacity-50"
                                onClick={handleUploadConfirm}
                                disabled={uploading || !pendingTitle.trim()}
                            >
                                {uploading ? 'Uploading…' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
