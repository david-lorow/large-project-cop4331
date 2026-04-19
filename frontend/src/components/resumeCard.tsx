import { useNavigate } from 'react-router-dom';

interface ResumeCardProps {
    id: string;
    name: string;
    date: string;
    thumbnailUrl?: string;
    onDelete: (id: string) => void;
}

const ResumeCard = ({ id, name, date, thumbnailUrl, onDelete }: ResumeCardProps) => {
    const navigate = useNavigate();
    const handleView = () => navigate(`/resume/${id}`);

    return (
        <div className="group relative bg-[#232323] rounded-[40px] p-8 flex flex-col items-center transition-all duration-300 hover:bg-[#222222] border border-transparent hover:border-gray-700">

            <div className="relative w-full aspect-[4/5] bg-[#d9d9d9] rounded-[30px] mb-6 overflow-hidden">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={`${name} preview`}
                        className="w-full h-full object-cover object-top"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                )}
            </div>

            <h3 className="text-2xl font-normal mb-2 text-center">{name}</h3>
            <p className="text-gray-400 text-sm">Uploaded: {date}</p>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[40px] flex flex-col items-center justify-center gap-4">
                <button
                    className="w-32 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 cursor-pointer"
                    onClick={handleView}
                >
                    View
                </button>
                <button
                    className="w-32 py-2 bg-[#8B0000] text-white rounded-lg font-semibold hover:bg-red-700 cursor-pointer"
                    onClick={() => {
                        if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
                            onDelete(id);
                        }
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ResumeCard;
