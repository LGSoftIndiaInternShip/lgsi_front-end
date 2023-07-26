/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Typography } from "@mui/material";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostApi } from "../../utils/https";
import Loader from "../../components/loader";
import { renderBoxes } from "../../utils/renderBox";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FirstPageIcon from "@mui/icons-material/FirstPage";

const ServerSide = () => {
  const controlTitle = useAnimation();
  const controlButton = useAnimation();
  const controlFileButton = useAnimation();
  const controlCanvas = useAnimation();
  const ref = useRef(null);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const inView = useInView(ref);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
  const [imageList, setImageList] = useState([]);
  const [inferenceDatas, setInferenceDatas] = useState([]);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoSize, setVideoSize] = useState({});
  const [paused, setPaused] = useState(true);
  const [clientPaused, setClientPaused] = useState(false);
  const [loopStarted, setLoopStarted] = useState(false);
  const [frame, setFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [opened, setOpened] = useState(false);
  const framesPerSecond = 20;
  const imageSpeed = 100;

  function dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleVideoLoaded = async () => {
    setVideoSize({
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    });
    const innerTotalFrames = parseInt(
      videoRef.current.duration * framesPerSecond
    );
    setTotalFrames(innerTotalFrames);

    imageRef.current.width = videoRef.current.videoWidth;
    imageRef.current.height = videoRef.current.videoHeight;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    canvasRef2.width = videoRef.current.videoWidth;
    canvasRef2.height = videoRef.current.videoHeight;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      videoRef.current.src = videoURL;
      videoRef.current.addEventListener("loadedmetadata", handleVideoLoaded);
      setOpened(true);
    }
  };

  const pauseHandler = () => {
    if (clientPaused) {
      setClientPaused(false);
    } else {
      setClientPaused(true);
    }
  };

  const moveOneFrameForward = () => {
    setFrame((old) => {
      if (old < totalFrames - 1) {
        return old + 1;
      } else {
        alert("Last frame!");
        return old;
      }
    });
  };

  const moveOneFrameBackward = () => {
    setFrame((old) => {
      if (old !== 0) {
        return old - 1;
      } else {
        alert("First frame!");
        return old;
      }
    });
  };

  const closeVideo = () => {
    controlCanvas.start({ opacity: 0 });
    setTotalFrames(0);
    setTimeout(() => {
      const url = videoRef.current.src;
      videoRef.current.src = ""; // restore video source
      URL.revokeObjectURL(url); // revoke url
      fileInputRef.current.value = "";
      setPaused(true);
      setClientPaused(false);
      setFrame(0);
      setImageList([]);
      setInferenceDatas([]);
      setVideoSize({});
      setLoopStarted(false);
      setOpened(false);
    }, 500);
  };

  useEffect(() => {
    const images = [];
    const interval = 1000 / framesPerSecond;
    const posting = async () => {
      for (let i = 0; i < totalFrames; i++) {
        if (!opened) {
          break;
        }
        const currentTime = (i * interval) / 1000;
        videoRef.current.currentTime = currentTime;

        if (i < 20) {
          setLoading(true);
        }

        // Wait for the video to seek to the desired time
        await new Promise((resolve) => {
          videoRef.current.addEventListener("seeked", resolve, { once: true });
        });

        const canvas = canvasRef2.current;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // canvas를 이미지로 변환
        const image = canvas.toDataURL("image/jpeg");
        images.push(image);

        if (images.length === 20 || i === totalFrames - 1) {
          const formData = new FormData();
          while (images.length > 0) {
            const newImage = images.shift();
            formData.append(
              "imageFile",
              dataURLtoFile(newImage, "image" + new Date().getTime() + ".jpg")
            );
            setImageList((old) => [...old, newImage]);
          }
          const beforeTime = new Date().getTime();
          await usePostApi(formData, {
            headers: { "Content-Type": "multipart/form-data" },
          }).then((response) => {
            console.log("time:", new Date().getTime() - beforeTime);
            setLoading(false);
            setInferenceDatas((old) => [...old, ...response.data]);
          });
        }
      }
    };
    posting();
  }, [totalFrames, opened]);

  useEffect(() => {
    let interval;
    const animateFrame = () => {
      setFrame((prevFrame) => {
        if (prevFrame === inferenceDatas.length - 1) {
          return prevFrame;
        } else {
          return parseInt(prevFrame + 1);
        }
      });
    };
    if (!paused && !clientPaused && frame < totalFrames - 1) {
      if (frame < inferenceDatas.length - 1) {
        setLoading(false);
        interval = setInterval(animateFrame, imageSpeed);
      } else if (frame === inferenceDatas.length - 1) {
        setPaused(true);
        setLoading(true);
      }
    }
    return () => clearInterval(interval);
  }, [frame, paused, clientPaused, totalFrames]);

  useEffect(() => {
    if (loopStarted) {
      console.log(frame);
      if (frame === totalFrames - 1) {
        setClientPaused(true);
      }
      setCurrentImage(imageList[frame]);
      if (inferenceDatas[frame]?.boxes.length > 0) {
        renderBoxes(
          canvasRef.current,
          inferenceDatas[frame].boxes,
          inferenceDatas[frame].scores,
          inferenceDatas[frame].classes,
          [videoSize.width, videoSize.height] // ratio
        );
      } else {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
      }
    }
  }, [frame, totalFrames]);

  useEffect(() => {
    if (frame < inferenceDatas.length - 1) {
      const trackingInterval = setInterval(() => {
        setLoading(false);
        setPaused(false);
      }, 1000);

      return () => {
        clearInterval(trackingInterval);
      };
    }
  }, [loading, frame, inferenceDatas]);

  useEffect(() => {
    // 최초 실행
    if (inferenceDatas.length > 19 && !loopStarted) {
      if (opened) {
        setLoopStarted(true);
        setPaused(false);
        setCurrentImage(imageList[frame]);
        imageRef.current.style.display = "block";
        controlCanvas.start({ opacity: 1 });
      } else {
        setLoading(false);
        setInferenceDatas([]);
      }
    }
  }, [inferenceDatas, opened]);

  useEffect(() => {
    if (inView) {
      controlTitle.start({ opacity: 1 });
      setTimeout(() => {
        controlButton.start({ opacity: 1 });
      }, 400);
      setTimeout(() => {
        controlTitle.start({ y: 0 });
      }, 700);
      setTimeout(() => {
        controlButton.start({ y: 0 });
      }, 800);
      setTimeout(() => {
        controlFileButton.start({ opacity: 1 });
      }, 800);
      setTimeout(() => {
        controlFileButton.start({ y: 0 });
      }, 1400);
    }
  }, [inView]);

  return (
    <div
      name="ServerSide"
      className="h-screen w-screen px-2.5 relative flex items-center flex-col"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={controlCanvas}
        transition={{
          duration: 0.5,
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
        className="absolute pt-6 w-screen h-screen flex justify-center items-center "
      >
        <div className="flex flex-col justify-between items-center">
          <div className="flex bg-black relative item-center justify-center mt-14 rounded-lg overflow-hidden">
            <video
              className="w-full max-w-[720px] max-h-[500px] rounded-lg overflow-hidden"
              type="file"
              accept="video/*"
              ref={videoRef}
              style={{ display: "none" }}
            />
            <img
              ref={imageRef}
              style={{
                display: "none",
                maxWidth: 720,
                maxHeight: 500,
              }}
              src={currentImage}
              alt="image1"
            />
            <canvas
              className="absolute w-full h-full hidden"
              width={720}
              height={500}
              ref={canvasRef2}
            />
            <canvas
              className="absolute w-full h-full z-10 rounded-lg overflow-hidden"
              width={720}
              height={500}
              ref={canvasRef}
            />
          </div>
          {loopStarted && (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="mt-4">
                <Button
                  sx={{
                    width: "4rem",
                    height: "4rem",
                    marginRight: "1rem",
                  }}
                  onClick={moveOneFrameBackward}
                  variant="outlined"
                  size="large"
                  disabled={!clientPaused || frame === 0}
                >
                  {"<"}
                </Button>
                <Button
                  sx={{
                    width: "4rem",
                    height: "4rem",
                    marginRight: "1rem",
                  }}
                  onClick={() => pauseHandler()}
                  variant="outlined"
                  size="large"
                  disabled={frame === totalFrames - 1}
                >
                  {clientPaused ? <PlayArrowIcon /> : <PauseIcon />}
                </Button>
                <Button
                  sx={{ width: "4rem", height: "4rem", marginRight: "1rem" }}
                  onClick={moveOneFrameForward}
                  variant="outlined"
                  size="large"
                  disabled={!clientPaused || frame === totalFrames - 1}
                >
                  {">"}
                </Button>
                <Button
                  sx={{ width: "4rem", height: "4rem", marginRight: "1rem" }}
                  onClick={() => setFrame(0)}
                  variant="outlined"
                  size="large"
                  disabled={frame !== totalFrames - 1}
                >
                  <FirstPageIcon />
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 300 }}
        animate={controlTitle}
        transition={{
          duration: 0.8,
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
        className={window.screen.height > 1000 ? "mt-16" : "mt-8"}
      >
        <Typography
          variant={window.screen.height > 1000 ? "h3" : "h4"}
          color="#ffffff"
          gutterBottom
        >
          OBJECT DETECTION (SERVER SIDE)
        </Typography>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 300 }}
        animate={controlButton}
        transition={{
          duration: 0.8,
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
      >
        <Button
          onClick={() => navigate("/")}
          variant="outlined"
          size={window.screen.height > 1000 ? "large" : "medium"}
        >
          GO TO CLIENT SIDE
        </Button>
      </motion.div>
      <motion.div
        className={
          window.screen.height > 1000
            ? "absolute bottom-8"
            : "absolute bottom-4"
        }
        initial={{ opacity: 0, y: -100 }}
        animate={controlFileButton}
        transition={{
          duration: 0.8,
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
      >
        <input
          style={{ display: "none" }}
          type="file"
          accept="video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button
          variant="outlined"
          size={window.screen.height > 1000 ? "large" : "small"}
          onClick={() => (opened ? closeVideo() : fileInputRef.current.click())}
        >
          {totalFrames > 0 ? "Close" : "Open"} VIDEO
        </Button>
      </motion.div>
      {inferenceDatas.length > 0 && (
        <div className="absolute w-64 h-64 top-0 right-0 flex flex-col items-center justify-center">
          <Typography
            variant={window.screen.height > 1000 ? "h6" : "h7"}
            color="#ffffff"
            gutterBottom
          >
            Frame : {frame + 1}
          </Typography>
          <Typography
            variant={window.screen.height > 1000 ? "h6" : "h7"}
            color="#ffffff"
            gutterBottom
          >
            Inferenced Frames : {inferenceDatas.length}
          </Typography>
          <Typography
            variant={window.screen.height > 1000 ? "h6" : "h7"}
            color="#ffffff"
            gutterBottom
          >
            Total Frames : {totalFrames}
          </Typography>
          <Typography
            variant={window.screen.height > 1000 ? "h6" : "h7"}
            color="#ffffff"
            gutterBottom
          >
            Frame Per Second : {1000 / imageSpeed}
          </Typography>
        </div>
      )}
      {loading && (
        <div className="absolute w-64 top-1/2 flex items-center justify-center">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default ServerSide;
