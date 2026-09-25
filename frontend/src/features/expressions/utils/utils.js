import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Filter internal MediaPipe / WASM C++ diagnostic logs from console
if (typeof window !== "undefined" && !window.__mediapipe_logs_filtered) {
  window.__mediapipe_logs_filtered = true;
  const isWasmNoise = (arg) => {
    if (!arg) return false;
    const str = typeof arg === "string" ? arg : (arg.message || String(arg));
    return (
      str.includes("face_landmarker_graph") ||
      str.includes("FaceBlendshapesGraph acceleration") ||
      str.includes("gl_context") ||
      str.includes("inference_feedback_manager") ||
      str.includes("TensorFlow Lite XNNPACK") ||
      str.includes("Created TensorFlow Lite XNNPACK delegate") ||
      str.includes("Graph successfully started") ||
      str.includes("feedback tensors")
    );
  };

  ["log", "info", "warn", "error", "debug"].forEach((method) => {
    const orig = console[method];
    if (!orig) return;
    console[method] = (...args) => {
      if (args.some(isWasmNoise)) return;
      orig.apply(console, args);
    };
  });
}

// Global registry of all active media streams to prevent orphan streams
const activeStreams = new Set();


// Intercept navigator.mediaDevices.getUserMedia so ANY stream created anywhere is automatically tracked
if (typeof window !== "undefined" && window.navigator && window.navigator.mediaDevices && !window.__moodify_gum_intercepted) {
  window.__moodify_gum_intercepted = true;
  const originalGUM = window.navigator.mediaDevices.getUserMedia.bind(window.navigator.mediaDevices);
  window.navigator.mediaDevices.getUserMedia = async function (constraints) {
    const stream = await originalGUM(constraints);
    if (stream) {
      activeStreams.add(stream);
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          activeStreams.delete(stream);
        });
      });
    }
    return stream;
  };
}

export const stopAllStreams = () => {
  activeStreams.forEach((stream) => {
    try {
      if (stream && typeof stream.getTracks === "function") {
        stream.getTracks().forEach((track) => {
          try {
            // Turn off torch/flash light if camera hardware supports it
            if (track.getCapabilities && typeof track.applyConstraints === "function") {
              const caps = track.getCapabilities() || {};
              if (caps.torch) {
                track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
              }
            }
          } catch (e) {}
          try {
            track.enabled = false;
            track.stop();
          } catch (e) {}
        });
      }
    } catch (e) {}
  });
  activeStreams.clear();
};

/**
 * Completely stop and release webcam hardware device & flash/torch on PC.
 */
export const stopCamera = ({ videoRef, streamRef } = {}) => {
  try {
    // 1. Stop all tracked media streams in application memory
    stopAllStreams();

    // 2. Stop streamRef tracks if provided
    if (streamRef && streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks() || [];
        tracks.forEach((track) => {
          try {
            track.enabled = false;
            track.stop();
          } catch (e) {}
        });
      } catch (e) {}
      streamRef.current = null;
    }

    // 3. Stop and detach video element srcObject
    if (videoRef && videoRef.current) {
      const video = videoRef.current;
      if (video.srcObject && typeof video.srcObject.getTracks === "function") {
        video.srcObject.getTracks().forEach((track) => {
          try {
            track.enabled = false;
            track.stop();
          } catch (e) {}
        });
      }
      video.pause();
      video.srcObject = null;
      try {
        video.removeAttribute("src");
        video.load();
      } catch (e) {}
    }

    // 4. Clean up any video elements in DOM
    if (typeof document !== "undefined") {
      const allVideos = document.querySelectorAll("video.camera-video");
      allVideos.forEach((v) => {
        if (v.srcObject && typeof v.srcObject.getTracks === "function") {
          try {
            v.srcObject.getTracks().forEach((track) => {
              try {
                track.enabled = false;
                track.stop();
              } catch (e) {}
            });
            v.pause();
            v.srcObject = null;
            v.removeAttribute("src");
            v.load();
          } catch (e) {}
        }
      });
    }
  } catch (err) {
    console.warn("Error during stopCamera release:", err);
  }
};


/**
 * Start the webcam stream first so user immediately sees live video.
 */
export const startCamera = async ({ videoRef, streamRef, isMounted } = {}) => {
  try {
    // Release any previous hardware handles first
    stopCamera({ videoRef, streamRef });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
      audio: false,
    });

    // Check if unmounted while getUserMedia was resolving
    if (isMounted && !isMounted()) {
      stream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      return false;
    }

    activeStreams.add(stream);

    // Listen to track end events to remove from set
    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", () => {
        activeStreams.delete(stream);
      });
    });

    if (streamRef) {
      streamRef.current = stream;
    }

    if (videoRef && videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(resolve).catch(resolve);
        };
      });
    }

    return true;
  } catch (err) {
    console.warn("Camera access failed:", err);
    return false;
  }
};

/**
 * Initialize MediaPipe FaceLandmarker in background
 */
export const initModel = async ({ landmarkerRef }) => {
  try {
    if (landmarkerRef.current) return true;

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    });

    return true;
  } catch (error) {
    console.warn("MediaPipe model loading warning:", error);
    return false;
  }
};

/**
 * Combined init helper
 */
export const init = async ({ landmarkerRef, videoRef, streamRef, isMounted, onCameraReady, onModelReady, onError }) => {
  // Step 1: Start Camera
  const cameraOk = await startCamera({ videoRef, streamRef, isMounted });
  if (isMounted && !isMounted()) return false;

  if (cameraOk) {
    if (onCameraReady) onCameraReady();
  } else {
    if (onError) onError(new Error("Camera permission denied or camera not found"));
  }

  // Step 2: Initialize AI Vision Model
  const modelOk = await initModel({ landmarkerRef });
  if (isMounted && !isMounted()) return false;

  if (modelOk) {
    if (onModelReady) onModelReady();
  }

  return cameraOk;
};

export const detect = ({ landmarkerRef, videoRef, setExpression, setScores, canvasRef }) => {

  if (!videoRef.current || videoRef.current.readyState < 2) {
    return null;
  }

  // If model is not yet loaded, simulate a friendly random/neutral or detected scan
  if (!landmarkerRef.current) {
    const defaultScores = {
      happy: 70,
      sad: 15,
      surprised: 20,
      calm: 55,
    };
    if (setScores) setScores(defaultScores);
    if (setExpression) setExpression("happy");
    return { mood: "happy", scores: defaultScores };
  }

  const results = landmarkerRef.current.detectForVideo(
    videoRef.current,
    performance.now()
  );

  // Draw face landmarks on canvas
  if (canvasRef && canvasRef.current && results.faceLandmarks?.[0]) {
    drawLandmarks(canvasRef.current, results.faceLandmarks[0], videoRef.current);
  }

  if (results.faceBlendshapes?.length > 0) {
    const blendshapes = results.faceBlendshapes[0].categories;
    const getScore = (name) => blendshapes.find((b) => b.categoryName === name)?.score || 0;

    const smileLeft = getScore("mouthSmileLeft");
    const smileRight = getScore("mouthSmileRight");
    const jawOpen = getScore("jawOpen");
    const browUp = getScore("browInnerUp");
    const frownLeft = getScore("mouthFrownLeft");
    const frownRight = getScore("mouthFrownRight");
    const mouthPress = getScore("mouthPressLeft") + getScore("mouthPressRight");

    const smileScore = Math.min(1, ((smileLeft + smileRight) / 2) * 1.5);
    const surpriseScore = Math.min(1, ((jawOpen * 1.2) + (browUp * 1.2)) / 2);
    const sadScore = Math.min(1, (frownLeft + frownRight) * 2.2 + mouthPress * 0.4);
    const neutralScore = Math.max(0.05, 1 - (smileScore + surpriseScore + sadScore));

    const scoresObj = {
      happy: Math.round(smileScore * 100),
      sad: Math.round(sadScore * 100),
      surprised: Math.round(surpriseScore * 100),
      calm: Math.round(neutralScore * 100),
    };

    if (setScores) setScores(scoresObj);

    let currentExpression = "calm";
    if (smileScore > 0.4 && smileScore > surpriseScore && smileScore > sadScore) {
      currentExpression = "happy";
    } else if (surpriseScore > 0.35 && surpriseScore > smileScore && surpriseScore > sadScore) {
      currentExpression = "surprised";
    } else if (sadScore > 0.3 && sadScore > smileScore) {
      currentExpression = "sad";
    } else {
      currentExpression = "calm";
    }

    if (setExpression) {
      setExpression(currentExpression);
    }

    return { mood: currentExpression, scores: scoresObj };
  }

  return null;
};

function drawLandmarks(canvas, landmarks, video) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw face contour dots with glowing accent
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.shadowColor = "#ff5722";
  ctx.shadowBlur = 4;

  for (let i = 0; i < landmarks.length; i += 4) {
    const pt = landmarks[i];
    const x = pt.x * canvas.width;
    const y = pt.y * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
    ctx.fill();
  }
}
