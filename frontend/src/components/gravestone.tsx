interface MemberProps {
    member: {
        name: string;
        role: string;
        img: string;
    }
}

const Gravestone = ({ member }: MemberProps) => {
    return (
        <div className="relative w-85 h-[500px] flex flex-col items-center group transition-transform duration-300 hover:-translate-y-4">

            <img 
                src="/assets/gravestoneTemplate.png"
                alt="Gravestone"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />

            <div className="relative z-10 flex flex-col items-center pt-24 w-full h-full px-8">
                <div className="w-24 h-24 rounded-full bg-[#d9d9d9] border-[3px] border-[#333333] overflow-hidden mb-5 shadow-inner">
                    <img 
                        src={member.img} 
                        alt={member.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                </div>

                <div className="text-center">
                    <p className="text-gray-400 text-[9px] tracking-[0.4em] uppercase opacity-80 mb-1">
                        Here Lies...
                    </p>
                    
                    <h3 className="text-white text-xl font-bold leading-tight tracking-tight mb-7">
                        {member.name}
                    </h3>

                    <div className="flex flex-col gap-0.5">
                        {member.role.split(',').map((line, index) => (
                            <p 
                                key={index} 
                                className="text-[#8B0000] font-semibold italic text-[10px] tracking-wider uppercase opacity-90 leading-tight"
                            >
                                {line.trim()}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gravestone;