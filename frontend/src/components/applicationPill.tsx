import type { Application } from '../api/client';

interface AppProps {
    app: Application;
}

const STATUS_COLORS: Record<string, string> = {
    rejected: 'text-red-500',
    interview: 'text-green-500',
    offer: 'text-emerald-400',
    ghosted: 'text-slate-500',
    applied: 'text-blue-400',
    saved: 'text-gray-400',
};

const ApplicationPill = ({ app }: AppProps) => {
    const statusColor = STATUS_COLORS[app.status] ?? 'text-white';
    const displayStatus = app.status.charAt(0).toUpperCase() + app.status.slice(1);
    const displayDate = app.dateApplied
        ? new Date(app.dateApplied).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : '—';

    return (
        <div className="grid grid-cols-4 items-center rounded-full py-3 px-2 border border-slate-500 shadow-md transition-transform hover:scale-[1.01]">
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
