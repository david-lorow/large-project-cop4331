import { useState, useEffect } from "react";
import { listResumes, reviewResume } from "../api/client";
import type { Resume } from "../api/client";

interface AIReviewProps {
    onStart: () => void;
    onChunk: (chunk: string) => void;
    onDone: () => void;
}

function AIReview({ onStart, onChunk, onDone }: AIReviewProps) {
    const [reviewToggle, setReviewToggle] = useState(false);

    // Job tailoring fields
    const [company, setCompany] = useState("");
    const [position, setPosition] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    // General review fields
    const [targetJob, setTargetJob] = useState("");
    const [additionalContext, setAdditionalContext] = useState("");

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResume, setSelectedResume] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        listResumes()
            .then(({ resumes: list }) => {
                setResumes(list);
                if (list.length > 0) setSelectedResume(list[0]._id);
            })
            .catch(() => setError("Failed to load resumes."));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResume) {
            setError("Please select a resume.");
            return;
        }
        setError("");
        setIsSubmitting(true);
        onStart();

        try {
            if (reviewToggle) {
                await reviewResume(
                    { resumeId: selectedResume, mode: "review", targetJob, additionalContext },
                    onChunk
                );
            } else {
                if (!company || !position || !jobDescription) {
                    setError("Please fill in Company, Position, and Job Description.");
                    setIsSubmitting(false);
                    return;
                }
                await reviewResume(
                    { resumeId: selectedResume, mode: "tailoring", company, position, jobDescription },
                    onChunk
                );
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Review failed.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
            onDone();
        }
    };

    return (
        <div className="bg-black h-full w-full flex">
            <div className="flex-col w-full">
                <div className="mt-5 flex justify-center">
                    <p className="text-white mr-3">Job Tailoring</p>
                    <button
                        type="button"
                        onClick={() => setReviewToggle(!reviewToggle)}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${reviewToggle ? "bg-[#8B0000]" : "bg-gray-300"}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${reviewToggle ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    <p className="text-white ml-3">Review</p>
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center mt-2">{error}</p>
                )}

                <div className="w-full flex justify-center">
                    {reviewToggle ? (
                        <form className="w-[70%] mt-28 pb-10" onSubmit={handleSubmit}>
                            <label htmlFor="targetJob" className="text-white tracking-wide">Target Job</label><br />
                            <input
                                className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1"
                                type="text"
                                id="targetJob"
                                value={targetJob}
                                onChange={e => setTargetJob(e.target.value)}
                            />

                            <label htmlFor="additionalInfo" className="text-white tracking-wide">Additional Information</label><br />
                            <textarea
                                rows={10}
                                className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1"
                                id="additionalInfo"
                                value={additionalContext}
                                onChange={e => setAdditionalContext(e.target.value)}
                            />

                            <label htmlFor="resumeSelectorReview" className="text-white tracking-wide">Resume</label>
                            <select
                                className="mt-2 mb-5 bg-white w-full h-8 rounded-sm shadow-lg p-1"
                                id="resumeSelectorReview"
                                value={selectedResume}
                                onChange={e => setSelectedResume(e.target.value)}
                            >
                                {resumes.length === 0 && <option value="">No resumes uploaded</option>}
                                {resumes.map(r => (
                                    <option key={r._id} value={r._id}>{r.title}</option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#8B0000] text-white w-full rounded-sm shadow-lg h-8 mt-16 hover:bg-[#AB0202] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Generating..." : "Submit"}
                            </button>
                        </form>
                    ) : (
                        <form className="w-[70%] mt-20 pb-10" onSubmit={handleSubmit}>
                            <label htmlFor="company" className="text-white tracking-wide">Company</label><br />
                            <input
                                className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1"
                                type="text"
                                id="company"
                                value={company}
                                onChange={e => setCompany(e.target.value)}
                            />

                            <label htmlFor="position" className="text-white tracking-wide">Position</label><br />
                            <input
                                className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1"
                                type="text"
                                id="position"
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                            />

                            <label htmlFor="jobDescription" className="text-white tracking-wide">Job Description</label><br />
                            <textarea
                                rows={10}
                                className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1"
                                id="jobDescription"
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                            />

                            <label htmlFor="resumeSelectorTailoring" className="text-white tracking-wide">Resume</label>
                            <select
                                className="mt-2 mb-5 bg-white w-full h-8 rounded-sm shadow-lg p-1"
                                id="resumeSelectorTailoring"
                                value={selectedResume}
                                onChange={e => setSelectedResume(e.target.value)}
                            >
                                {resumes.length === 0 && <option value="">No resumes uploaded</option>}
                                {resumes.map(r => (
                                    <option key={r._id} value={r._id}>{r.title}</option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#8B0000] text-white w-full rounded-sm shadow-lg h-8 mt-10 hover:bg-[#AB0202] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Generating..." : "Submit"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AIReview;
