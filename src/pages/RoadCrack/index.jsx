/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Typography } from "@mui/material";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePostApi } from "../../utils/https";

const RoadCrack = () => {
  const controlTitle = useAnimation();
  const controlButton = useAnimation();
  const controlCanvas = useAnimation();
  const ref = useRef(null);
  const imageRef = useRef(null);
  const inView = useInView(ref);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const renamedFile = new File([file], "image_" + new Date().getTime(), {
      type: file.type,
      lastModified: file.lastModified,
    });
    const formData = new FormData();
    formData.append("imageFile", renamedFile);

    usePostApi(formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((response) => {
      console.log(response.data);
    });
  };

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
    }
  }, [inView]);

  return (
    <div
      name="RoadCrack"
      className="h-screen w-screen px-2.5 relative flex items-center flex-col"
    >
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
        className="mt-16"
      >
        <Typography variant="h3" color="#ffffff" gutterBottom>
          Road Crack
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
        <Button onClick={() => navigate("/")} variant="outlined" size="large">
          GO TO OBJECT DETECTION
        </Button>
      </motion.div>
      <div>
        <input
          style={{ display: "none" }}
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button variant="outlined" onClick={() => fileInputRef.current.click()}>
          파일 선택
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 1 }}
        animate={controlCanvas}
        transition={{
          duration: 0.5,
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
        className="flex justify-center items-center"
      >
        <div className="flex flex-col justify-between items-center">
          <div className="flex bg-black relative item-center justify-center rounded-lg overflow-hidden mx-8">
            <img
              className="w-full max-w-[720px] max-h-[500px]"
              src="#"
              ref={imageRef}
              alt=""
            />
            <canvas
              className="absolute w-full h-full bg-white"
              width={416}
              height={416}
              ref={canvasRef}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoadCrack;
