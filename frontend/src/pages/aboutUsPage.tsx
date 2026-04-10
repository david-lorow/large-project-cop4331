import Navbar from '../components/navBar';
import Gravestone from '../components/gravestone';

// array of team members (hardcoded)
const teamMembers = [
    { id: 1, name: "Tyler Wyskochil", role: "Project Manager, Mobile Frontend", img: "/assets/tylerW.png", linked: "https://www.linkedin.com/in/tyler-wyskochil-ba305a32a"},
    { id: 2, name: "Alex Weninski", role: "Web Frontend", img: "/assets/alexW.png", linked: "https://www.linkedin.com/in/aweninski/" },
    { id: 3, name: "David Lorow", role: "API Lead", img: "/assets/davidL.jpg", linked: "https://www.linkedin.com/in/david-lorow/" },
    { id: 4, name: "Amanda Go", role: "Web Frontend", img: "/assets/amandaG.jpg", linked: "https://www.linkedin.com/in/amandago30/" },
    { id: 5, name: "Jeshua Casanola", role: "Database Lead", img: "/assets/jeshuaC.jpg", linked: "https://www.linkedin.com/in/jeshua-casanola-436609302/" },
];

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <main className="flex-1 flex flex-col items-center py-20">
                <h1 className="text-4xl font-medium mb-24 tracking-widest uppercase text-center">
                    The Team Behind the Scythe
                </h1>

                <div className="flex flex-wrap justify-center gap-x-16 gap-y-24 w-full max-w-[1600px] mx-auto px-10">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="flex justify-center">
                            <Gravestone member={member} />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AboutUs;