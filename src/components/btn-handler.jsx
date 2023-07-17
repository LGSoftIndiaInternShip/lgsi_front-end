import { useRef, useState } from "react";
import { Webcam } from "../utils/webcam";
import { Button } from "@mui/material";

const ButtonHandler = ({ cameraRef, videoRef, controlVideo }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const webcam = new Webcam(); // webcam handler
  const inputVideoRef = useRef(null); // video input reference

  // closing video streaming
  const closeVideo = () => {
    controlVideo.start({ opacity: 0 });
    setTimeout(() => {
      const url = videoRef.current.src;
      videoRef.current.src = ""; // restore video source
      URL.revokeObjectURL(url); // revoke url
      setStreaming(null); // set streaming to null
      inputVideoRef.current.value = ""; // reset input video
      videoRef.current.style.display = "none"; // hide video
    }, 500);
  };

  return (
    <div className="btn-container">
      {/* Video Handler */}
      <input
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          videoRef.current.src = url; // set video source
          videoRef.current.addEventListener("ended", () => closeVideo()); // add ended video listener
          videoRef.current.style.display = "block"; // show video
          setStreaming("video"); // set streaming to video
          controlVideo.start({ opacity: 1 });
        }}
        ref={inputVideoRef}
      />
      <Button
        variant="outlined"
        size="small"
        sx={{ marginRight: 4 }}
        onClick={() => {
          // if not streaming
          if (streaming === null) inputVideoRef.current.click();
          // closing video streaming
          else if (streaming === "video") closeVideo();
          else
            alert(
              `Can't handle more than 1 stream\nCurrently streaming : ${streaming}`
            ); // if streaming webcam
        }}
      >
        {streaming === "video" ? "Close" : "Open"} Video
      </Button>
      {/* Webcam Handler */}
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          // if not streaming
          if (streaming === null) {
            webcam.open(cameraRef.current, controlVideo); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
          }
          // closing video streaming
          else if (streaming === "camera") {
            controlVideo.start({ opacity: 0 });
            setTimeout(() => {
              webcam.close(cameraRef.current);
              cameraRef.current.style.display = "none";
              setStreaming(null);
            }, 500);
          } else
            alert(
              `Can't handle more than 1 stream\nCurrently streaming : ${streaming}`
            ); // if streaming video
        }}
      >
        {streaming === "camera" ? "Close" : "Open"} Webcam
      </Button>
    </div>
  );
};

export default ButtonHandler;
