import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

interface HLSResult {
  hlsLevel: number;
  hlsLevels: Array<{ height: number; bitrate: number }>;
}

export function useHLS(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  src: string | undefined,
): HLSResult {
  const hlsRef = useRef<Hls | null>(null);
  const [hlsLevel, setHlsLevel] = useState(-1);
  const [hlsLevels, setHlsLevels] = useState<
    Array<{ height: number; bitrate: number }>
  >([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHLS = src.includes(".m3u8");

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxBufferHole: 0.5,
        startLevel: -1,
        lowLatencyMode: true,
        enableWorker: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setHlsLevels(
          data.levels.map((l) => ({ height: l.height, bitrate: l.bitrate })),
        );
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setHlsLevel(data.level);
      });
    } else if (isHLS && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoRef, src]);

  return { hlsLevel, hlsLevels };
}
