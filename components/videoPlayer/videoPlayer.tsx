import { useEffect, useRef } from "react";
import videojs from "video.js";
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
    options: any;
}

export const VideoPlayer = ({ options }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<Player | null>(null);

    useEffect(() => {
        if (playerRef.current || !videoRef.current) return;

        if (typeof window !== "undefined" && videoRef.current && !playerRef.current) {
            playerRef.current = videojs(videoRef.current, options, () => {
                console.log("Player is ready");
            });
        }

        return () => {
            if (playerRef.current) {
              playerRef.current.dispose();
              playerRef.current = null;
            }
        };

    }, [options]);

    return (
        <div>
          <div data-vjs-player>
            <video ref={videoRef} className="video-js vjs-default-skin" />
          </div>
        </div>
    );
}