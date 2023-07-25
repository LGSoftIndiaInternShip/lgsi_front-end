/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Typography } from "@mui/material";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostApi } from "../../utils/https";
import Loader from "../../components/loader";
import { renderBoxes } from "../../utils/renderBox";

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
  const [loading, setLoading] = useState(0);
  const [videoSize, setVideoSize] = useState();
  const [frame, setFrame] = useState(0);

  // const imagePost = (e) => {
  //   const file = e.target.files[0];
  //   const renamedFile = new File([file], "image_" + new Date().getTime(), {
  //     type: file.type,
  //     lastModified: file.lastModified,
  //   });
  //   const formData = new FormData();
  //   formData.append("imageFile", renamedFile);

  //   usePostApi(formData, {
  //     headers: { "Content-Type": "multipart/form-data" },
  //   }).then((response) => {
  //     console.log(response.data);
  //   });
  // };
  // const downloadImage = (dataURL, fileName) => {
  //   const link = document.createElement("a");
  //   link.href = dataURL;
  //   link.download = fileName;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // const handleImageLoad = () => {
  //   setImageLoaded(true);
  // };

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
    // 비디오가 로딩되면 20분의 1초씩 이동하면서 사진 추출
    setLoading(0);
    setImageList([]);
    setInferenceDatas([]);
    setVideoSize({
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    });
    imageRef.current.width = videoRef.current.videoWidth;
    imageRef.current.height = videoRef.current.videoHeight;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    canvasRef2.width = videoRef.current.videoWidth;
    canvasRef2.height = videoRef.current.videoHeight;

    const framesPerSecond = 20;
    const interval = 1000 / framesPerSecond;
    const totalFrames = videoRef.current.duration * framesPerSecond;

    for (let i = 0; i < totalFrames; i++) {
      // for (let i = 0; i < 1; i++) {
      // setLoading(
      //   (videoRef.current.currentTime / videoRef.current.duration) * 100
      // );
      const currentTime = (i * interval) / 1000;
      videoRef.current.currentTime = currentTime;

      // Wait for the video to seek to the desired time
      await new Promise((resolve) => {
        videoRef.current.addEventListener("seeked", resolve, { once: true });
      });

      const canvas = canvasRef2.current;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // canvas를 이미지로 변환
      const image = canvas.toDataURL("image/jpeg");
      const imageFile = dataURLtoFile(
        image,
        "image" + new Date().getTime() + ".jpg"
      );

      const formData = new FormData();
      formData.append("imageFile", imageFile);
      const beforeTime = new Date().getTime();
      await usePostApi(formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((response) => {
        setCurrentImage(image);
        imageRef.current.style.display = "block";
        handleResponse(response, beforeTime);
        if (response.data[0].boxes.length > 0) {
          renderBoxes(
            canvasRef.current,
            response.data[0].boxes,
            response.data[0].scores,
            response.data[0].classes,
            [videoRef.current.videoWidth, videoRef.current.videoHeight] //ratio
          );
        } else {
          const canvasContext = canvasRef.current.getContext("2d");
          canvasContext.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
        }
      });
    }
  };

  const handleResponse = (response, beforeTime) => {
    console.log(new Date().getTime() - beforeTime);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      videoRef.current.src = videoURL;
      videoRef.current.addEventListener("loadedmetadata", handleVideoLoaded);
    }
  };

  // useEffect(() => {
  //   if (imageList.length > 0 && inferenceDatas.length > 0) {
  //     console.log(inferenceDatas[frame]);
  //     if (!!inferenceDatas[frame].boxes) {
  //       renderBoxes(
  //         canvasRef.current,
  //         inferenceDatas[frame].boxes,
  //         inferenceDatas[frame].scores,
  //         inferenceDatas[frame].classes,
  //         [videoSize.width, videoSize.height] //ratio
  //       );
  //     }
  //     // console.log(new File(imageList[i]));
  //     // downloadImage(imageList[i], "image_" + new Date().getTime() + ".jpg");
  //     // if (i < imageList.length) {
  //     //   // 다음 순회를 50ms 후에 실행
  //     //   setTimeout(loop, 50);
  //     // }
  //     setFrame((old) => old + 1);
  //   }

  //   // 최초 실행
  // }, [inferenceDatas]);

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
        initial={{ opacity: 1 }}
        animate={controlCanvas}
        transition={{
          duration: 0.5,
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
        className="absolute pt-6 w-screen h-screen flex justify-center items-center"
      >
        <div className="flex flex-col justify-between items-center">
          <div className="flex bg-black relative item-center justify-center rounded-lg overflow-hidden mx-8">
            <video
              className="w-full max-w-[720px] max-h-[500px]"
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
              className="absolute w-full h-full z-10"
              width={720}
              height={500}
              ref={canvasRef}
            />
          </div>
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
            ? "absolute bottom-32"
            : "absolute bottom-16"
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
          onClick={() => fileInputRef.current.click()}
        >
          CHOOSE VIDEO FILE
        </Button>
      </motion.div>
      {/* {loading > 0 && loading <= 99 && (
        <div className="absolute w-screen h-screen flex items-center justify-center">
          <Loader>Inferencing...{loading.toFixed(2)}%</Loader>
        </div>
      )} */}
    </div>
  );
};

export default ServerSide;
