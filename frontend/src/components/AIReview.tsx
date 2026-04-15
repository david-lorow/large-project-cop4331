import { useState } from "react";

function AIReview() {

    const [reviewToggle, setReviewToggle] = useState(false);

    const [company, setCompany] = useState("");
    const [position, setPosition] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    const [targetJob, setTargetJob] = useState("");
    const [additionalContext, setAdditionalContext] = useState("");

    const [_resumes, _setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState("");

    return (
        <div className="bg-black h-full w-full flex">
            <div className="flex-col w-full">
                <div className="mt-5 flex justify-center">
                    <p className="text-white mr-3">Job Tailoring</p>
                    <button onClick={() => setReviewToggle(!reviewToggle)} className={`w-12 h-6 rounded-full transition-colors duration-200 ${reviewToggle ? "bg-[#8B0000]" : "bg-gray-300"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${reviewToggle ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    <p className="text-white ml-3">Review</p>
                </div>

                <div className=" w-full flex justify-center">
                    {reviewToggle ?
                        <form className="w-[70%] mt-28">
                            <label htmlFor="targetJob" className="text-white tracking-wide">Target Job</label><br />
                            <input className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1" type="text" id="targetJob" value={targetJob} onChange={e => setTargetJob(e.target.value)}></input>

                            <label htmlFor="additionalInfo" className="text-white tracking-wide">Additional Information</label><br />
                            <textarea rows={10} className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1" id="additionalInfo" value={additionalContext} onChange={e => setAdditionalContext(e.target.value)}></textarea>

                            <label htmlFor="resumeSelector" className="text-white tracking-wide">Resume</label>
                            <select className="mt-2 mb-5 bg-white w-full h-8 rounded-sm shadow-lg p-1" id="resumeSelector" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                                <option>Placeholder</option>
                            </select>

                            <button type="submit" className="bg-[#8B0000] text-white w-full rounded-sm shadow-lg h-8 mt-16 hover:bg-[#AB0202]">Submit</button>

                        </form> :
                        <form className="w-[70%] mt-20">
                            <label htmlFor="company" className="text-white tracking-wide">Company</label><br />
                            <input className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1" type="text" id="company" value={company} onChange={e => setCompany(e.target.value)}></input>

                            <label htmlFor="position" className="text-white tracking-wide">Position</label><br />
                            <input className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1" type="text" id="position" value={position} onChange={e => setPosition(e.target.value)}></input>

                            <label htmlFor="jobDesciption" className="text-white tracking-wide">Job Description</label><br />
                            <textarea rows={10} className="mt-2 mb-5 bg-white rounded-sm shadow-lg w-full p-1" id="jobDescription" value={jobDescription} onChange={e => setJobDescription(e.target.value)}></textarea>

                            <label htmlFor="resumeSelector" className="text-white tracking-wide">Resume</label>
                            <select className="mt-2 mb-5 bg-white w-full h-8 rounded-sm shadow-lg p-1" id="resumeSelector" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                                <option>Placeholder</option>
                            </select>

                            <button type="submit" className="bg-[#8B0000] text-white w-full rounded-sm shadow-lg h-8 mt-10 hover:bg-[#AB0202]">Submit</button>

                        </form>}
                </div>
            </div>

        </div>
    );
}

export default AIReview;