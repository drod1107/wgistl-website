// src/app/components/VideoPlayer.tsx

type VideoPlayerProps = {
    title: string;
    description: string;
    embedUrl: string;
};

export default function VideoPlayer({ title, description, embedUrl }: VideoPlayerProps) {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="w-full h-full">
                <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            <div className="w-full p-4">
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="text-lg">{description}</p>
            </div>
        </div>
    );
}