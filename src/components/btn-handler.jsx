import { useRef } from "react";
import { Webcam } from "../utils/webcam";
import { Button } from "@mui/material";

const ButtonHandler = ({
  canvasRef,
  imageRef,
  cameraRef,
  videoFrameRef,
  controlCanvas,
  streaming,
  setStreaming,
  setVideoPaused,
}) => {
  const webcam = new Webcam(); // webcam handler
  const inputImageRef = useRef(null); // video input reference
  const inputVideoFrameRef = useRef(null); // video input reference

  // closing image
  const closeImage = () => {
    const ctx = canvasRef.current.getContext("2d");
    controlCanvas.start({ opacity: 0 });
    setTimeout(() => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
      const url = imageRef.current.src;
      imageRef.current.src = "#"; // restore image source
      URL.revokeObjectURL(url); // revoke url
      setStreaming(null); // set streaming to null
      inputImageRef.current.value = ""; // reset input image
      imageRef.current.style.display = "none"; // hide imag
    }, 500);
  };

  // closing video streaming
  const closeVideo = () => {
    controlCanvas.start({ opacity: 0 });
    setTimeout(() => {
      const url = videoFrameRef.current.src;
      videoFrameRef.current.src = ""; // restore video source
      URL.revokeObjectURL(url); // revoke url
      setStreaming(null); // set streaming to null
      inputVideoFrameRef.current.value = ""; // reset input video
      videoFrameRef.current.style.display = "none"; // hide video
      setVideoPaused(true);
    }, 500);
  };

  return (
    <div className="btn-container">
      {/* Image Handler */}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          imageRef.current.src = url; // set video source
          imageRef.current.style.display = "block"; // show video
          setStreaming("image"); // set streaming to video
          controlCanvas.start({ opacity: 1 });
        }}
        ref={inputImageRef}
      />
      <Button
        variant="outlined"
        size="small"
        sx={{ marginRight: 4 }}
        onClick={() => {
          // if not streaming
          if (streaming === null) inputImageRef.current.click();
          // closing image streaming
          else if (streaming === "image") closeImage();
          else
            alert(
              `Can't handle more than 1 stream\nCurrently streaming : ${streaming}`
            ); // if streaming video or webcam
        }}
      >
        {streaming === "image" ? "Close" : "Open"} Image
      </Button>
      {/* Video(Frame) Handler */}
      <input
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (streaming === "image") closeImage(); // closing image streaming
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          videoFrameRef.current.src = url; // set video source
          videoFrameRef.current.addEventListener("ended", () => closeVideo()); // add ended video listener
          videoFrameRef.current.style.display = "block"; // show video
          setStreaming("videoFrame"); // set streaming to videoFrame
          controlCanvas.start({ opacity: 1 });
        }}
        ref={inputVideoFrameRef}
      />
      <Button
        variant="outlined"
        size="small"
        sx={{ marginRight: 4 }}
        onClick={() => {
          // if not streaming
          if (streaming === null) inputVideoFrameRef.current.click();
          // closing video streaming
          else if (streaming === "videoFrame") closeVideo();
          else
            alert(
              `Can't handle more than 1 stream\nCurrently streaming : ${streaming}`
            ); // if streaming webcam
        }}
      >
        {streaming === "videoFrame" ? "Close" : "Open"} Video
      </Button>
      {/* Webcam Handler */}
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          // if not streaming
          if (streaming === null || streaming === "image") {
            if (streaming === "image") closeImage();
            webcam.open(cameraRef.current, controlCanvas); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
          }
          // closing video streaming
          else if (streaming === "camera") {
            controlCanvas.start({ opacity: 0 });
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
