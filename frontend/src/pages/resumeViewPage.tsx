import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResume, getVersionDownloadUrl, listApplications, createApplication, updateApplication, deleteApplication, uploadResumeVersion } from '../api/client';
import type { Resume, ResumeVersion, Application } from '../api/client';
import ApplicationPill from '../components/applicationPill';
import Navbar from '../components/navBar';

const SOURCE_LABELS: Record<ResumeVersion['source'], string> = {
    upload: 'upload',
    ai_edit: 'AI edit',
    manual_edit: 'manual edit',
};

const SOURCE_COLORS: Record<ResumeVersion['source'], string> = {
    upload: 'bg-blue-900/50 text-blue-300',
    ai_edit: 'bg-purple-900/50 text-purple-300',
    manual_edit: 'bg-green-900/50 text-green-300',
};

const EMPTY_FORM = {
    companyName: '',
    jobTitle: '',
    status: 'applied' as Application['status'],
    dateApplied: '',
    jobLink: '',
    location: '',
};

const ResumeViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [resume, setResume] = useState<Resume | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string>('');
    const [versions, setVersions] = useState<ResumeVersion[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [versionFile, setVersionFile] = useState<File | null>(null);
    const [versionCommit, setVersionCommit] = useState('');
    const [uploadingVersion, setUploadingVersion] = useState(false);

    useEffect(() => {
        if (!id) return;
        getResume(id)
            .then(({ resume, versions, downloadUrl }) => {
                setResume(resume);
                setDownloadUrl(downloadUrl);
                setVersions(versions);
                const headId = resume.headVersionId ?? null;
                setSelectedVersionId(headId);
                return listApplications(id, headId ?? undefined);
            })
            .then(({ applications }) => setApplications(applications))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleSelectVersion = async (version: ResumeVersion) => {
        if (version._id === selectedVersionId) return;
        setSelectedVersionId(version._id);
        try {
            const [{ downloadUrl }, { applications }] = await Promise.all([
                getVersionDownloadUrl(id!, version._id),
                listApplications(id!, version._id),
            ]);
            setDownloadUrl(downloadUrl);
            setApplications(applications);
        } catch (err) {
            console.error('Failed to switch version:', err);
        }
    };

    const handlePrint = () => {
        if (!downloadUrl) return;
        const w = window.open(downloadUrl, '_blank');
        if (w) w.addEventListener('load', () => w.print());
    };

    const handleAddApplication = async () => {
        if (!id || !form.companyName.trim() || !form.jobTitle.trim()) return;
        setSubmitting(true);
        try {
            const { application } = await createApplication({ ...form, resumeId: id, resumeVersionId: selectedVersionId ?? undefined });
            setApplications((prev) => [application, ...prev]);
            setIsModalOpen(false);
            setForm(EMPTY_FORM);
        } catch (err) {
            console.error('Failed to create application:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteApplication = async (appId: string) => {
        try {
            await deleteApplication(appId);
            setApplications((prev) => prev.filter((a) => a._id !== appId));
        } catch (err) {
            console.error('Failed to delete application:', err);
        }
    };

    const handleOpenEdit = (app: Application) => {
        setEditingApp(app);
        setEditForm({
            companyName: app.companyName,
            jobTitle: app.jobTitle,
            status: app.status,
            dateApplied: app.dateApplied ? app.dateApplied.slice(0, 10) : '',
            jobLink: app.jobLink ?? '',
            location: app.location ?? '',
        });
    };

    const handleUpdateApplication = async () => {
        if (!editingApp || !editForm.companyName.trim() || !editForm.jobTitle.trim()) return;
        setEditSubmitting(true);
        try {
            const { application } = await updateApplication(editingApp._id, {
                companyName: editForm.companyName,
                jobTitle: editForm.jobTitle,
                status: editForm.status,
                dateApplied: editForm.dateApplied || undefined,
                jobLink: editForm.jobLink || undefined,
                location: editForm.location || undefined,
            });
            setApplications((prev) => prev.map((a) => (a._id === application._id ? application : a)));
            setEditingApp(null);
        } catch (err) {
            console.error('Failed to update application:', err);
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleUploadVersion = async () => {
        if (!id || !versionFile || !versionCommit.trim()) return;
        setUploadingVersion(true);
        try {
            const { version } = await uploadResumeVersion(id, versionFile, versionCommit.trim());
            setIsVersionModalOpen(false);
            setVersionFile(null);
            setVersionCommit('');
            // Reload resume and switch to the new version
            const { resume: refreshed, versions: refreshedVersions, downloadUrl: freshUrl } = await getResume(id);
            setResume(refreshed);
            setVersions(refreshedVersions);
            setDownloadUrl(freshUrl);
            setSelectedVersionId(version._id);
            const { applications } = await listApplications(id, version._id);
            setApplications(applications);
        } catch (err) {
            console.error('Failed to upload new version:', err);
        } finally {
            setUploadingVersion(false);
        }
    };

    const headVersionId = resume?.headVersionId;

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

                {/* Right: Applications + Version History */}
                <div className="w-7/12 p-8 overflow-y-auto bg-[#1a1a1a]">
                    <div className="max-w-3xl mx-auto">
                        <button
                            onClick={() => navigate('/home')}
                            className="mt-1 mb-12 text-3xl hover:text-gray-400 transition-colors cursor-pointer flex items-center"
                        >
                            ←
                        </button>

                        {/* Applications */}
                        <div className="bg-[#8B0000] rounded-t-2xl p-4 flex justify-between items-center shadow-lg">
                            <div className="ml-4">
                                <h2 className="text-3xl font-normal">Applications</h2>
                                {selectedVersionId && versions.length > 0 && (() => {
                                    const v = versions.find((v) => v._id === selectedVersionId);
                                    return v ? (
                                        <p className="text-xs text-red-300 mt-0.5">v{v.versionNumber} — {v.commitMessage}</p>
                                    ) : null;
                                })()}
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-white text-black px-6 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all mr-4 cursor-pointer"
                            >
                                Add
                            </button>
                        </div>

                        <div className="bg-[#232323] rounded-b-2xl p-6 min-h-[200px] shadow-2xl border-t border-black/20">
                            <div className="grid grid-cols-4 text-center text-sm mb-4 text-gray-300 font-light tracking-wide">
                                <div>Company</div>
                                <div>Position</div>
                                <div>Status</div>
                                <div>Date Applied</div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {applications.length === 0 ? (
                                    <p className="text-center text-gray-600 text-sm py-8">No applications yet</p>
                                ) : (
                                    applications.map((app) => (
                                        <div key={app._id} className="group relative">
                                            <ApplicationPill app={app} onEdit={() => handleOpenEdit(app)} />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteApplication(app._id)}
                                                    className="text-gray-400 hover:text-red-400 text-xs px-2 cursor-pointer"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Version History */}
                        <div className="mt-8">
                            <div className="bg-[#3a2020] rounded-t-2xl p-4 flex justify-between items-center shadow-lg">
                                <h2 className="text-2xl font-normal ml-4">Version History</h2>
                                <button
                                    onClick={() => setIsVersionModalOpen(true)}
                                    className="bg-white text-black px-6 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all mr-4 cursor-pointer"
                                >
                                    Upload V{versions.length + 1}
                                </button>
                            </div>
                            <div className="bg-[#232323] rounded-b-2xl p-6 shadow-2xl border-t border-black/20">
                                {versions.length === 0 ? (
                                    <p className="text-center text-gray-600 text-sm py-8">No versions yet</p>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {[...versions].reverse().map((v, idx) => {
                                            const isHead = headVersionId === v._id;
                                            const isSelected = selectedVersionId === v._id;
                                            return (
                                                <div key={v._id}>
                                                    <div
                                                        onClick={() => handleSelectVersion(v)}
                                                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${
                                                            isSelected
                                                                ? 'bg-[#2e1f1f] border border-[#8B0000]/40'
                                                                : 'bg-[#1e1e1e] hover:bg-[#272727]'
                                                        }`}
                                                    >
                                                        {/* Version badge */}
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${isSelected ? 'bg-[#8B0000] text-white' : 'bg-[#333] text-gray-400'}`}>
                                                            v{v.versionNumber}
                                                        </div>

                                                        {/* Commit message + meta */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-white truncate">{v.commitMessage}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${SOURCE_COLORS[v.source]}`}>
                                                                    {SOURCE_LABELS[v.source]}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(v.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                                            {isHead && (
                                                                <span className="text-xs text-[#8B0000] font-semibold">HEAD</span>
                                                            )}
                                                            {isSelected && (
                                                                <span className="text-xs text-gray-400">viewing</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Connector line between versions */}
                                                    {idx < versions.length - 1 && (
                                                        <div className="ml-[22px] w-0.5 h-3 bg-gray-700" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload New Version Modal */}
            {isVersionModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#232323] p-8 rounded-2xl w-[420px] border border-[#3a2020]">
                        <h3 className="text-xl mb-6 font-normal">Upload New Version</h3>

                        <div className="flex flex-col gap-3">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-gray-400">PDF File</span>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setVersionFile(e.target.files?.[0] ?? null)}
                                    className="w-full p-2 bg-white text-black rounded outline-none text-sm cursor-pointer"
                                />
                            </label>
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="What changed? (commit message)"
                                value={versionCommit}
                                onChange={(e) => setVersionCommit(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => { setIsVersionModalOpen(false); setVersionFile(null); setVersionCommit(''); }}
                                className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadVersion}
                                disabled={uploadingVersion || !versionFile || !versionCommit.trim()}
                                className="flex-1 bg-[#3a2020] py-2 rounded-lg hover:bg-[#4a2828] cursor-pointer disabled:opacity-50"
                            >
                                {uploadingVersion ? 'Uploading…' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Application Modal */}
            {editingApp && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#232323] p-8 rounded-2xl w-[420px] border border-[#8B0000]">
                        <h3 className="text-xl mb-6 font-normal">Edit Application</h3>

                        <div className="flex flex-col gap-3">
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="Company *"
                                value={editForm.companyName}
                                onChange={(e) => setEditForm((f) => ({ ...f, companyName: e.target.value }))}
                            />
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="Job Title *"
                                value={editForm.jobTitle}
                                onChange={(e) => setEditForm((f) => ({ ...f, jobTitle: e.target.value }))}
                            />
                            <select
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                value={editForm.status}
                                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as Application['status'] }))}
                            >
                                <option value="saved">Saved</option>
                                <option value="applied">Applied</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                                <option value="ghosted">Ghosted</option>
                            </select>
                            <input
                                type="date"
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                value={editForm.dateApplied}
                                onChange={(e) => setEditForm((f) => ({ ...f, dateApplied: e.target.value }))}
                            />
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="Job Link (optional)"
                                value={editForm.jobLink}
                                onChange={(e) => setEditForm((f) => ({ ...f, jobLink: e.target.value }))}
                            />
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="Location (optional)"
                                value={editForm.location}
                                onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setEditingApp(null)}
                                className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateApplication}
                                disabled={editSubmitting || !editForm.companyName.trim() || !editForm.jobTitle.trim()}
                                className="flex-1 bg-[#8B0000] py-2 rounded-lg hover:bg-red-800 cursor-pointer disabled:opacity-50"
                            >
                                {editSubmitting ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Application Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#232323] p-8 rounded-2xl w-[420px] border border-[#8B0000]">
                        <h3 className="text-xl mb-6 font-normal">New Application</h3>

                        <div className="flex flex-col gap-3">
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="Company *"
                                value={form.companyName}
                                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                            />
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="Job Title *"
                                value={form.jobTitle}
                                onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                            />
                            <select
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                value={form.status}
                                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Application['status'] }))}
                            >
                                <option value="saved">Saved</option>
                                <option value="applied">Applied</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                                <option value="ghosted">Ghosted</option>
                            </select>
                            <input
                                type="date"
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                value={form.dateApplied}
                                onChange={(e) => setForm((f) => ({ ...f, dateApplied: e.target.value }))}
                            />
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="Job Link (optional)"
                                value={form.jobLink}
                                onChange={(e) => setForm((f) => ({ ...f, jobLink: e.target.value }))}
                            />
                            <input
                                className="w-full p-2 bg-white text-black rounded outline-none"
                                placeholder="Location (optional)"
                                value={form.location}
                                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => { setIsModalOpen(false); setForm(EMPTY_FORM); }}
                                className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddApplication}
                                disabled={submitting || !form.companyName.trim() || !form.jobTitle.trim()}
                                className="flex-1 bg-[#8B0000] py-2 rounded-lg hover:bg-red-800 cursor-pointer disabled:opacity-50"
                            >
                                {submitting ? 'Adding…' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeViewPage;
