import { useEffect, useState } from "react";

export default function VideoStatusBar({ videoRef, width = 0 }) {
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    const updateProgress = () => {
      const fullWidth =
        videoElement.videoWidth > 720 ? 720 : videoElement.videoWidth;
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setBarWidth((currentTime / duration) * fullWidth);
    };
    videoElement.addEventListener("timeupdate", updateProgress);
    return () => {
      videoElement.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  return (
    <div
      className="relative max-w-[720px] h-1 bg-[#a0a0a0] rounded-sm overflow-hidden"
      style={{
        width:
          videoRef.current.videoWidth >= 0 ? videoRef.current.videoWidth : 0,
      }}
    >
      <div
        className="absolute left-0 bg-white h-1"
        style={{
          width: barWidth,
        }}
      />
    </div>
  );
}
