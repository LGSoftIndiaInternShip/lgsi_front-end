import { Button, Typography } from "@mui/material";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const RoadCrack = () => {
  const controlTitle = useAnimation();
  const controlButton = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref);
  const navigate = useNavigate();

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
          OBJECT DETECTION
        </Button>
      </motion.div>
    </div>
  );
};

export default RoadCrack;
