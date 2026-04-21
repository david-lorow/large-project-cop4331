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
<<<<<<< HEAD
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
=======
    const statusColor = STATUS_COLORS[app.status] ?? 'text-black';
    const displayStatus = app.status.charAt(0).toUpperCase() + app.status.slice(1);
    const displayDate = app.dateApplied
        ? new Date(app.dateApplied).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : '—';

    return (
        <div className="grid grid-cols-4 items-center bg-white rounded-full py-3 px-2 text-black shadow-md transition-transform hover:scale-[1.01]">
            <div className="text-center font-normal text-xl">{app.companyName}</div>
            <div className="text-center font-normal text-xl">{app.jobTitle}</div>
            <div className={`text-center text-xl ${statusColor}`}>
                {displayStatus}
            </div>
            <div className="text-center text-xl font-normal">
                {displayDate}
>>>>>>> 5a6aaf2 (Resumes as repos)
            </div>
        </div>
    );
};

export default ApplicationPill;
