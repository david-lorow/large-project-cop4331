interface AISuggestionsProps {
    suggestion: string;
    isLoading: boolean;
}

function AISuggestions({ suggestion, isLoading }: AISuggestionsProps) {
    return (
        <div className="bg-black h-full w-full flex items-start justify-center pt-[7.75rem]">
            <div className="w-[70%]">
                <p className="text-white text-small tracking-wide">
                    Suggested Changes
                    {isLoading && <span className="ml-2 text-gray-400 text-xs animate-pulse">Generating...</span>}
                </p>

                <textarea
                    rows={22}
                    readOnly
                    className="bg-white text-base resize-none w-full shadow-lg rounded-sm mt-3 p-2"
                    value={suggestion || (isLoading ? "" : "Submit a review request to see suggestions here.")}
                    placeholder={isLoading ? "Generating suggestions..." : ""}
                />
            </div>
        </div>
    );
}

export default AISuggestions;
