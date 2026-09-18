import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

const TryOnModal = ({ product, onClose }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastCoordsRef = useRef(null);
  const glassesImgRef = useRef(new Image());

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  // Models load karo
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Model load failed:', err);
      }
    };
    loadModels();
  }, []);

  // Glasses image load karo
  useEffect(() => {
    const img = glassesImgRef.current;
    img.src = product.overlayImage;
    lastCoordsRef.current = null;
  }, [product.overlayImage]);

  // Face tracking loop
  // Face tracking loop — Mirrored Webcam Adjustments Fixed
  const trackFace = useCallback(async () => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    if (!video || video.readyState < 4 || video.videoWidth === 0 || !canvas) {
      animFrameRef.current = requestAnimationFrame(trackFace);
      return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    if (canvas.width !== vw) canvas.width = vw;
    if (canvas.height !== vh) canvas.height = vh;

    const opts = new faceapi.TinyFaceDetectorOptions({
      inputSize: 160,
      scoreThreshold: 0.5,
    });

    const det = await faceapi.detectSingleFace(video, opts).withFaceLandmarks(true);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, vw, vh);

    if (det) {
      setFaceDetected(true);
      const resized = faceapi.resizeResults(det, { width: vw, height: vh });
      const pts = resized.landmarks.positions;

      // Face API indexes: Left Outer Eye (36), Right Outer Eye (45)
      const leftOuter  = pts[36];
      const rightOuter = pts[45];

      // Proportional math calibration based on eye width separation
      const eyeWidth = rightOuter.x - leftOuter.x;
      
      // Multipliers ko tune kiya hai taake transparent assets side lines ke sath sahi fit hon
      const frameWidth  = eyeWidth * 2.3; 
      const frameHeight = frameWidth * 0.45; 

      const dx = rightOuter.x - leftOuter.x;
      const dy = rightOuter.y - leftOuter.y;
      
      // WEBCAM MIRROR FIX: Kyunki webcam flipped hai, face angle ki direction bhi invert (- angle) hogi
      const angle = Math.atan2(dy, dx);

      // Centroid reference calculations between pupils
      const cx = (leftOuter.x + rightOuter.x) / 2;
      
      // Y-axis positioning offset: thoda sa upar shift kiya taake nose bridge par perfect baithe
      const cy = (leftOuter.y + rightOuter.y) / 2 - frameHeight * 0.08;

      const ALPHA = 0.45; // Smooth rendering factor to avoid shaking
      if (!lastCoordsRef.current) {
        lastCoordsRef.current = { cx, cy, frameWidth, frameHeight, angle };
      } else {
        const s = lastCoordsRef.current;
        s.cx          += (cx          - s.cx)          * ALPHA;
        s.cy          += (cy          - s.cy)          * ALPHA;
        s.frameWidth  += (frameWidth  - s.frameWidth)  * ALPHA;
        s.frameHeight += (frameHeight - s.frameHeight) * ALPHA;
        s.angle       += (angle       - s.angle)       * ALPHA;
      }
    } else {
      setFaceDetected(false);
    }

    const s = lastCoordsRef.current;
    const img = glassesImgRef.current;

    if (s && img.complete && img.naturalWidth > 0) {
      ctx.save();
      
      // STEP 1: Canvas grid matrix ko live video component ki tarah flip karein
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);

      // STEP 2: Kyunki space flipped hai, faceapi ka detected X co-ordinate flip axis se match karega
      // Is wajah se hum ab right side se calculation matrix shift karenge: (vw - s.cx)
      ctx.translate(vw - s.cx, s.cy);
      
      // STEP 3: Apply inverted angle transformation
      ctx.rotate(-s.angle);
      
      // Draw glasses overlay
      ctx.drawImage(
        img,
        -s.frameWidth / 2,
        -s.frameHeight / 2,
        s.frameWidth,
        s.frameHeight
      );
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(trackFace);
  }, []);

  // Start/stop tracking
  useEffect(() => {
    if (modelsLoaded && cameraReady) {
      animFrameRef.current = requestAnimationFrame(trackFace);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [modelsLoaded, cameraReady, trackFace]);

  // Unmount par camera band karo
  useEffect(() => {
    return () => {
      const stream = webcamRef.current?.video?.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div className="modal-title">
            📷 Virtual Try-On — {product.name}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="camera-wrap">
          {!modelsLoaded && (
            <div className="model-loading">
              <div className="spinner" />
              <p>Loading AI face tracker…</p>
            </div>
          )}
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
            onUserMedia={() => setCameraReady(true)}
            style={{ display: modelsLoaded ? 'block' : 'none' }}
          />
        <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: 'scaleX(-1)', // Is se drawing aur webcam stream bilkul match ho jayengi
              pointerEvents: 'none',
              display: modelsLoaded ? 'block' : 'none'
            }}
          />
        </div>

        <p className="modal-hint">
          {!modelsLoaded
            ? 'Please allow camera access when prompted.'
            : faceDetected
            ? '✅ Face detected — move naturally!'
            : '👤 Align your face in the frame'}
        </p>
      </div>
    </div>
  );
};

export default TryOnModal;