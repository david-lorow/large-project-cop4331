interface AppProps {
    app: {
        company: string;
        position: string;
        status: string;
        date: string;
    }
}

const ApplicationPill = ({ app }: AppProps) => {
    const getStatusColor = (status: string) => {
        if (status === 'Denied') return 'text-red-500';
        if (status === 'Interview') return 'text-green-500';
        if (status === 'Ghosted') return 'text-mauve-400';
        return 'text-mist-400';
    };

    return (
        <div className="grid grid-cols-4 items-center bg-#8B0000 rounded-full py-3 px-2 text-black border border-slate-500 shadow-md transition-transform hover:scale-[1.01]">
            <div className="text-center font-normal text-xl text-white">{app.company}</div>
            <div className="text-center font-normal text-xl text-white">{app.position}</div>
            <div className={`text-center text-xl ${getStatusColor(app.status)}`}>
                {app.status}
            </div>
            <div className="text-center text-xl text-white font-normal">
                {app.date}
            </div>
        </div>
    );
};

export default ApplicationPill;