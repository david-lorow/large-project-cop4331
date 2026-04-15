import AISuggestions from "../components/AISuggestions";
import AIReview from "../components/AIReview";
import Navbar from "../components/navBar";

const AIReviewPage = () => {

    return (
        <div className='flex flex-col w-screen min-h-screen'>
            <Navbar />
            <div className='flex flex-1 items-stretch'>
                <div className='w-1/2'>
                    <AISuggestions />
                </div>
                <div className='w-1/2'>
                    <AIReview />
                </div>
            </div>
        </div>
    );
}

export default AIReviewPage;
