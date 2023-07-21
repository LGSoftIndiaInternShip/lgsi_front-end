import { Button } from "@mui/material";
import React, { useState, useRef } from "react";

const VideoCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  // 파일 선택 시 실행되는 이벤트 핸들러
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(event.target.files[0]); // create blob url
    videoRef.current.src = url; // set video source
    setSelectedFile(file);
  };

  // 추출 시작 버튼 클릭 시 실행되는 이벤트 핸들러
  const handleExtractStart = () => {
    if (!selectedFile) {
      alert("동영상 파일을 먼저 선택해주세요.");
      return;
    }

    const videoElement = videoRef.current;
    videoElement.src = URL.createObjectURL(selectedFile);
    videoElement.addEventListener("loadeddata", handleVideoLoaded);
  };

  // 추출 중단 버튼 클릭 시 실행되는 이벤트 핸들러
  const handleExtractStop = () => {
    const videoElement = videoRef.current;
    videoElement.src = ""; // 동영상 중지
    setCapturedImages([]); // 이미지 상태 초기화
  };

  // 동영상 로드 완료 후 실행되는 이벤트 핸들러
  const handleVideoLoaded = () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasContext = canvasElement.getContext("2d");

    // 동영상의 가로, 세로 크기를 캔버스에 맞게 설정
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // 프레임 추출 함수
    const extractFrames = (currentTime, totalFrames) => {
      if (totalFrames >= 100) {
        // 이미지 추출이 완료된 경우
        console.log("Image extraction complete!");
        return;
      }

      // 현재 시간의 프레임을 캔버스에 그리기
      canvasContext.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // 캔버스에 그려진 이미지를 데이터 URI로 변환하여 저장
      const imageURI = canvasElement.toDataURL("image/jpeg");

      // 추출한 이미지를 상태에 추가
      setCapturedImages((prevImages) => [...prevImages, imageURI]);

      // 다음 프레임 추출을 위해 0.05초 뒤에 재귀 호출
      setTimeout(() => {
        extractFrames(videoElement.currentTime + 1 / 20, totalFrames + 1);
      }, 50);
    };

    // 프레임 추출 시작
    extractFrames(0, 0);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      {/* 파일 선택 */}
      <input type="file" accept="video/*" onChange={handleFileChange} />

      {/* 동영상 요소 */}
      <video ref={videoRef} controls />

      {/* 추출된 이미지들을 보여줄 영역 */}
      {capturedImages.map((imageURI, index) => (
        <img key={index} src={imageURI} alt={`Captured Frame ${index + 1}`} />
      ))}

      {/* 추출 버튼 */}
      <div>
        <Button variant="outlined" onClick={handleExtractStart}>
          이미지 추출 시작
        </Button>
        <Button variant="outlined" onClick={handleExtractStop}>
          이미지 추출 중단
        </Button>
      </div>
    </div>
  );
};

export default VideoCapture;
