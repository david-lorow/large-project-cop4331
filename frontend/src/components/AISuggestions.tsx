import { useState } from "react";

function AISuggestions() {

    const [suggestion, _setSuggestion] = useState("AI Suggestion here");

    return (
        <div className="bg-black h-full w-full flex items-start justify-center pt-[7.75rem]">
            <div className="w-[70%]">
                <p className="text-white text-small tracking-wide">Suggested Changes</p>

                <textarea rows={22} readOnly className="bg-white text-base resize-none w-full shadow-lg rounded-sm mt-3 p-2" value={suggestion}></textarea>
            </div>
        </div>
    );
}

export default AISuggestions;