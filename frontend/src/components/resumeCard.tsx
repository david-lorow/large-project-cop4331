interface ResumeCardProps {
    name: string;
    date: string;
}

const ResumeCard = ({ name, date }: ResumeCardProps) => {
    return (
        <div className="group relative bg-[#232323] rounded-[40px] p-8 flex flex-col items-center transition-all duration-300 hover:bg-[#222222] border border-transparent hover:border-gray-700">
            
            <div className="w-full aspect-[4/5] bg-[#d9d9d9] rounded-[30px] mb-6 flex items-center justify-center overflow-hidden">
                <p className="text-gray-500 text-sm italic">PDF Preview</p>
            </div>

            <h3 className="text-2xl font-normal mb-2 text-center">{name}</h3>
            <p className="text-gray-400 text-sm">Uploaded: {date}</p>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[40px] flex flex-col items-center justify-center gap-4">
                <button className="w-32 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 cursor-pointer" onClick={() => console.log("Viewing", name)}>View</button>
                <button className="w-32 py-2 bg-[#8B0000] text-white rounded-lg font-semibold hover:bg-red-700 cursor-pointer" onClick={() => console.log("Deleting", name)}>Delete</button>
            </div>
        </div>
    );
};

export default ResumeCard;