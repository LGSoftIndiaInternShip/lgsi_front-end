import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "../components/loader";
import ButtonHandler from "../components/btn-handler";
import { detectVideo } from "../utils/detect";
import { Button, Typography } from "@mui/material";
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ObjectDetection = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape
  const navigate = useNavigate();
  // references
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const controlTitle = useAnimation();
  const controlButton = useAnimation();
  const controlButtons = useAnimation();
  const controlVideo = useAnimation();

  // model configs
  const modelName = "yolov8n";

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  useEffect(() => {
    if (!loading.loading) {
      controlTitle.start({ opacity: 1 });
      setTimeout(() => {
        controlButton.start({ opacity: 1 });
      }, 400);
      setTimeout(() => {
        controlButtons.start({ opacity: 1 });
      }, 800);
      setTimeout(() => {
        controlTitle.start({ y: 0 });
      }, 700);
      setTimeout(() => {
        controlButton.start({ y: 0 });
      }, 800);
      setTimeout(() => {
        controlButtons.start({ y: 0 });
      }, 1400);
    }
  }, [loading]);

  return (
    <div
      name="ObjectDetection"
      className={"w-screen h-screen px-2.5 relative flex items-center flex-col"}
    >
      {loading.loading && (
        <Loader>Loading model... {(loading.progress * 100).toFixed(2)}%</Loader>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={controlVideo}
        transition={{
          duration: 0.5,
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
        className="absolute w-full h-full flex justify-center items-center"
      >
        <div className="flex bg-black my-10 relative item-center justify-center rounded-lg overflow-hidden">
          <video
            className="hidden w-full max-w-[720px] max-h-[500px]"
            autoPlay
            muted
            loop
            ref={videoRef}
            onPlay={() =>
              detectVideo(videoRef.current, model, canvasRef.current)
            }
          />
          <video
            className="hidden w-full max-w-[720px] max-h-[500px]"
            autoPlay
            muted
            ref={cameraRef}
            onPlay={() =>
              detectVideo(cameraRef.current, model, canvasRef.current)
            }
          />
          <canvas
            className="absolute w-full h-full"
            width={model.inputShape[1]}
            height={model.inputShape[2]}
            ref={canvasRef}
          />
        </div>
      </motion.div>
      <motion.div
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
          OBJECT DETECTION
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
          onClick={() => navigate("/roadCrack")}
          variant="outlined"
          size="large"
        >
          Road Crack
        </Button>
      </motion.div>
      <motion.div
        className="absolute bottom-32"
        initial={{ opacity: 0, y: -100 }}
        animate={controlButtons}
        transition={{
          duration: 0.8,
          type: "spring",
          damping: 10,
          stiffness: 100,
        }}
      >
        <ButtonHandler
          cameraRef={cameraRef}
          videoRef={videoRef}
          controlVideo={controlVideo}
        />
      </motion.div>
    </div>
  );
};

export default ObjectDetection;
