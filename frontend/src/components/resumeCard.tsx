import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { getToken } from '../api/client';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).href;

interface ResumeCardProps {
    id: string;
    name: string;
    date: string;
    pdfUrl: string;
    onDelete: (id: string) => void;
}

const ResumeCard = ({ id, name, date, pdfUrl, onDelete }: ResumeCardProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [thumbnailReady, setThumbnailReady] = useState(false);

    useEffect(() => {
        if (!pdfUrl) return;
        let cancelled = false;

        const render = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument({
                    url: pdfUrl,
                    httpHeaders: { Authorization: `Bearer ${getToken() ?? ''}` },
                });
                const pdf = await loadingTask.promise;
                if (cancelled) return;

                const page = await pdf.getPage(1);
                if (cancelled) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const containerWidth = canvas.parentElement?.clientWidth ?? 300;
                const viewport = page.getViewport({ scale: 1 });
                const scale = containerWidth / viewport.width;
                const scaledViewport = page.getViewport({ scale });

                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;

                await page.render({
                    canvasContext: canvas.getContext('2d')!,
                    viewport: scaledViewport,
                    canvas,
                }).promise;

                if (!cancelled) setThumbnailReady(true);
            } catch (err) {
                console.error('PDF render error:', err);
            }
        };

        render();
        return () => { cancelled = true; };
    }, [pdfUrl]);

    const handleView = async () => {
        try {
            const res = await fetch(pdfUrl, {
                headers: { Authorization: `Bearer ${getToken() ?? ''}` },
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Failed to open PDF:', err);
        }
    };

    return (
        <div className="group relative bg-[#232323] rounded-[40px] p-8 flex flex-col items-center transition-all duration-300 hover:bg-[#222222] border border-transparent hover:border-gray-700">

            <div className="relative w-full aspect-[4/5] bg-[#d9d9d9] rounded-[30px] mb-6 overflow-hidden">
                {!thumbnailReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-500 text-sm italic">Loading preview…</p>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    className="w-full block"
                    style={{ display: thumbnailReady ? 'block' : 'none' }}
                />
            </div>

            <h3 className="text-2xl font-normal mb-2 text-center">{name}</h3>
            <p className="text-gray-400 text-sm">Uploaded: {date}</p>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[40px] flex flex-col items-center justify-center gap-4">
                <button
                    className="w-32 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 cursor-pointer"
                    onClick={handleView}
                >
                    View
                </button>
                <button
                    className="w-32 py-2 bg-[#8B0000] text-white rounded-lg font-semibold hover:bg-red-700 cursor-pointer"
                    onClick={() => onDelete(id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ResumeCard;
