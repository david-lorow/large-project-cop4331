import { useState } from "react";
import AISuggestions from "../components/AISuggestions";
import AIReview from "../components/AIReview";
import Navbar from "../components/navBar";

const AIReviewPage = () => {
    const [suggestion, setSuggestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = () => {
        setSuggestion("");
        setIsLoading(true);
    };

    const handleChunk = (chunk: string) => {
        setSuggestion(prev => prev + chunk);
    };

    const handleDone = () => {
        setIsLoading(false);
    };

    return (
        <div className='flex flex-col w-screen min-h-screen'>
            <Navbar />
            <div className='flex flex-1 items-stretch'>
                <div className='w-1/2'>
                    <AISuggestions suggestion={suggestion} isLoading={isLoading} />
                </div>
                <div className='w-1/2'>
                    <AIReview onStart={handleStart} onChunk={handleChunk} onDone={handleDone} />
                </div>
            </div>
        </div>
    );
}

export default AIReviewPage;
