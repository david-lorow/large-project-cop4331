interface AppProps {
    app: {
        company: string;
        status: string;
        date: string;
    }
}

const ApplicationPill = ({ app }: AppProps) => {
    // Logic for color coding status if you want later
    const getStatusColor = (status: string) => {
        if (status === 'Denied') return 'text-red-500';
        if (status === 'Interview') return 'text-green-500';
        return 'text-black'; // Purgatory
    };

    return (
        <div className="grid grid-cols-4 items-center bg-white rounded-full py-3 px-2 text-black shadow-md transition-transform hover:scale-[1.01]">
            <div className="text-center font-medium text-xl">{app.company}</div>
            <div className={`text-center text-xl ${getStatusColor(app.status)}`}>
                {app.status}
            </div>
            <div className="flex justify-center">
                <button className="border border-red-300 text-[#8B0000] text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
                    Add Reply
                </button>
            </div>
            <div className="text-center text-xl font-light">
                {app.date}
            </div>
        </div>
    );
};

export default ApplicationPill;