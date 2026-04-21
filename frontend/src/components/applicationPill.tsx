import type { Application } from '../api/client';

interface AppProps {
    app: Application;
    onEdit: () => void;
}

const STATUS_COLORS: Record<string, string> = {
    rejected: 'text-red-500',
    interview: 'text-green-500',
    offer: 'text-emerald-400',
    ghosted: 'text-slate-500',
    applied: 'text-blue-400',
    saved: 'text-gray-400',
};

const ApplicationPill = ({ app, onEdit }: AppProps) => {
    const statusColor = STATUS_COLORS[app.status] ?? 'text-white';
    const displayStatus = app.status.charAt(0).toUpperCase() + app.status.slice(1);
    const displayDate = app.dateApplied
        ? new Date(app.dateApplied).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : '—';

    return (
        <div className="group relative grid grid-cols-4 items-center rounded-full py-3 px-2 border border-slate-500 shadow-md transition-transform hover:scale-[1.01] overflow-hidden">
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <button onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                }} className="bg-white text-black px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                    Edit
                </button>
            </div>

            <div className="text-center font-normal text-xl text-white">{app.companyName}</div>
            <div className="text-center font-normal text-xl text-white">{app.jobTitle}</div>
            <div className={`text-center text-xl ${statusColor}`}>
                {displayStatus}
            </div>
            <div className="text-center text-xl text-white font-normal">
                {displayDate}
            </div>
        </div>
    );
};

export default ApplicationPill;
