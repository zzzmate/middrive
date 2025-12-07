"use client";

import React, { useState, useEffect, useRef } from "react";

const parseTime = (timeString) => {
  const parts = timeString.split(":");
  let seconds = 0;
  let minutes = 0;
  let hours = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    const secParts = parts[2].split(",");
    seconds = parseInt(secParts[0], 10);
    const ms = secParts[1] ? parseInt(secParts[1], 10) : 0;
    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10);
    const secParts = parts[1].split(".");
    seconds = parseInt(secParts[0], 10);
    const ms = secParts[1] ? parseInt(secParts[1], 10) : 0;
    return minutes * 60 + seconds + ms / 1000;
  }
  return 0;
};

const parseSubtitleFile = (content) => {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const entries = [];
  let currentEntry = { start: 0, end: 0, text: "" };
  let state = "id";

  const timeRegex =
    /(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})/;

  for (let line of lines) {
    line = line.trim();

    if (line === "") {
      if (currentEntry.text) {
        entries.push(currentEntry);
      }
      currentEntry = { start: 0, end: 0, text: "" };
      state = "id";
      continue;
    }

    if (line.includes("-->")) {
      const match = line.match(timeRegex);
      if (match) {
        currentEntry.start = parseTime(match[1]);
        currentEntry.end = parseTime(match[2]);
        state = "text";
      }
    } else if (state === "text") {
      currentEntry.text = currentEntry.text
        ? `${currentEntry.text}\n${line}`
        : line;
    }
  }

  if (currentEntry.text) {
    entries.push(currentEntry);
  }

  return entries;
};

export default function VideoPlayer({ src, poster, title }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const timelineRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPanel, setCurrentPanel] = useState("main");
  const [subtitlePosition, setSubtitlePosition] = useState("bottom");
  const [parsedSubtitles, setParsedSubtitles] = useState([]);
  const [activeSubtitleText, setActiveSubtitleText] = useState("");

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const sec = Math.floor(time % 60);
    const min = Math.floor(time / 60) % 60;
    const hr = Math.floor(time / 3600);
    return hr === 0
      ? `${min}:${String(sec).padStart(2, "0")}`
      : `${hr}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (parsedSubtitles.length > 0) {
        const currentSub = parsedSubtitles.find(
          (sub) => time >= sub.start && time <= sub.end
        );
        setActiveSubtitleText(currentSub ? currentSub.text : "");
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimelineChange = (e) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + seconds, duration)
      );
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    if (!videoRef.current?.paused) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleSubtitleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const parsed = parseSubtitleFile(content);
        setParsedSubtitles(parsed);
      };
      reader.readAsText(file);
    }
  };

  const getSubtitlePositionClass = () => {
    switch (subtitlePosition) {
      case "top":
        return "top-10 left-1/2 -translate-x-1/2";
      case "bottom-left":
        return "bottom-24 left-10";
      case "bottom-right":
        return "bottom-24 right-10";
      case "bottom":
      default:
        return "bottom-24 left-1/2 -translate-x-1/2";
    }
  };

  const progress = (currentTime / duration) * 100 || 0;

  return (
    <div
      ref={playerRef}
      className="relative w-full aspect-video bg-[#0a0a0a] group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !videoRef.current?.paused && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        crossOrigin="anonymous"
      />

      {activeSubtitleText && (
        <div
          className={`absolute z-20 pointer-events-none text-center px-4 py-2 rounded bg-[#0a0a0a]/50 transition-all duration-300 ${getSubtitlePositionClass()}`}
        >
          <p className="text-white text-lg font-medium whitespace-pre-line leading-relaxed">
            {activeSubtitleText}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {showSettings && (
        <div
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => {
            setShowSettings(false);
            setCurrentPanel("main");
          }}
        >
          <div
            className="bg-black border border-white/10 rounded-lg w-80 max-h-[450px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {currentPanel === "main" && (
              <div className="p-4">
                <button
                  onClick={() => setCurrentPanel("audio")}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 rounded flex items-center justify-between text-white"
                >
                  <span>Audio</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPanel("video")}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 rounded flex items-center justify-between text-white"
                >
                  <span>Video</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPanel("subtitles")}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 rounded flex items-center justify-between text-white"
                >
                  <span>Subtitles</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPanel("playback")}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 rounded flex items-center justify-between text-white"
                >
                  <span>Playback Rate</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded text-white"
                >
                  Fullscreen
                </button>
              </div>
            )}

            {currentPanel === "subtitles" && (
              <div className="p-4">
                <button
                  onClick={() => setCurrentPanel("main")}
                  className="flex items-center text-white mb-4 hover:text-white/80"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Subtitles</span>
                </button>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setParsedSubtitles([]);
                      setActiveSubtitleText("");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 rounded text-white"
                  >
                    OFF
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 rounded text-white flex justify-between items-center"
                  >
                    Add Subtitle File
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".vtt,.srt"
                    onChange={handleSubtitleUpload}
                    className="hidden"
                  />

                  <div className="pt-4 border-t border-white/10">
                    <div className="text-white text-sm mb-2">Position</div>
                    <select
                      value={subtitlePosition}
                      onChange={(e) => setSubtitlePosition(e.target.value)}
                      className="appearance-none w-full bg-[#0a0a0a] text-white px-4 py-2 rounded border border-white/20 focus:outline-none focus:border-white/40 cursor-pointer"
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentPanel === "audio" && (
              <div className="p-4">
                <button
                  onClick={() => setCurrentPanel("main")}
                  className="flex items-center text-white mb-4 hover:text-white/80"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Audio</span>
                </button>
                <div className="text-white/60 text-sm">
                  No audio tracks available
                </div>
              </div>
            )}

            {currentPanel === "video" && (
              <div className="p-4">
                <button
                  onClick={() => setCurrentPanel("main")}
                  className="flex items-center text-white mb-4 hover:text-white/80"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Video</span>
                </button>
                <div className="text-white/60 text-sm">
                  No video tracks available
                </div>
              </div>
            )}

            {currentPanel === "playback" && (
              <div className="p-4">
                <button
                  onClick={() => setCurrentPanel("main")}
                  className="flex items-center text-white mb-4 hover:text-white/80"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Playback Rate</span>
                </button>
                <div className="space-y-1">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        if (videoRef.current)
                          videoRef.current.playbackRate = rate;
                      }}
                      className={`w-full text-left px-4 py-2 rounded hover:bg-white/10 ${
                        playbackRate === rate
                          ? "bg-white/20 text-white"
                          : "text-white"
                      }`}
                    >
                      {rate === 1 ? "Normal" : `${rate}x`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent p-4 transition-opacity duration-300 z-40 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full mb-4 relative group/timeline">
          <input
            ref={timelineRef}
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleTimelineChange}
            className="w-full h-1 bg-white/30 rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
            style={{
              background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:scale-110 transition-transform"
            >
              {isPlaying ? (
                <svg
                  className="w-6 h-6"
                  transform="scale(1.3)"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => skip(-10)}
              className="transform scale-x-[-1] hover:scale-x-[-1] hover:scale-110 text-white transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z" />
              </svg>
            </button>

            <button
              onClick={() => skip(10)}
              className="text-white hover:scale-110 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z" />
              </svg>
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:scale-110 transition-transform"
            >
              {isMuted || volume === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="w-6 h-6"
                  fill="currentColor"
                >
                  <path d="M80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416zM399 239C389.6 248.4 389.6 263.6 399 272.9L446 319.9L399 366.9C389.6 376.3 389.6 391.5 399 400.8C408.4 410.1 423.6 410.2 432.9 400.8L479.9 353.8L526.9 400.8C536.3 410.2 551.5 410.2 560.8 400.8C570.1 391.4 570.2 376.2 560.8 366.9L513.8 319.9L560.8 272.9C570.2 263.5 570.2 248.3 560.8 239C551.4 229.7 536.2 229.6 526.9 239L479.9 286L432.9 239C423.5 229.6 408.3 229.6 399 239z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  className="w-6 h-6"
                  fill="currentColor"
                >
                  <path d="M144 416L192 416L326.1 535.2C332.5 540.9 340.7 544 349.2 544C368.4 544 384 528.4 384 509.2L384 130.8C384 111.6 368.4 96 349.2 96C340.7 96 332.5 99.1 326.1 104.8L192 224L144 224C117.5 224 96 245.5 96 272L96 368C96 394.5 117.5 416 144 416zM476.6 245.5C466.3 237.1 451.2 238.7 442.8 249C434.4 259.3 436 274.4 446.3 282.8C457.1 291.6 464 305 464 320C464 335 457.1 348.4 446.3 357.3C436 365.7 434.5 380.8 442.8 391.1C451.1 401.4 466.3 402.9 476.6 394.6C498.1 376.9 512 350.1 512 320C512 289.9 498.1 263.1 476.5 245.5z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M533.6 96.5C523.3 88.1 508.2 89.7 499.8 100C491.4 110.3 493 125.4 503.3 133.8C557.5 177.8 592 244.8 592 320C592 395.2 557.5 462.2 503.3 506.3C493 514.7 491.5 529.8 499.8 540.1C508.1 550.4 523.3 551.9 533.6 543.6C598.5 490.7 640 410.2 640 320C640 229.8 598.5 149.2 533.6 96.5zM473.1 171C462.8 162.6 447.7 164.2 439.3 174.5C430.9 184.8 432.5 199.9 442.8 208.3C475.3 234.7 496 274.9 496 320C496 365.1 475.3 405.3 442.8 431.8C432.5 440.2 431 455.3 439.3 465.6C447.6 475.9 462.8 477.4 473.1 469.1C516.3 433.9 544 380.2 544 320.1C544 260 516.3 206.3 473.1 171.1zM412.6 245.5C402.3 237.1 387.2 238.7 378.8 249C370.4 259.3 372 274.4 382.3 282.8C393.1 291.6 400 305 400 320C400 335 393.1 348.4 382.3 357.3C372 365.7 370.5 380.8 378.8 391.1C387.1 401.4 402.3 402.9 412.6 394.6C434.1 376.9 448 350.1 448 320C448 289.9 434.1 263.1 412.6 245.5zM80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416z" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/95 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
            />

            <span className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className="text-white hover:scale-110 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                />
              </svg>
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:scale-110 transition-transform"
            >
              {isFullscreen ? (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.29 3.29C3.11 3.46 3.01 3.70 3.00 3.94C2.98 4.19 3.06 4.43 3.22 4.63L3.29 4.70L7.58 8.99H5C4.73 8.99 4.48 9.10 4.29 9.29C4.10 9.47 4 9.73 4 9.99C4 10.26 4.10 10.51 4.29 10.70C4.48 10.89 4.73 10.99 5 10.99H11V4.99C11 4.73 10.89 4.47 10.70 4.29C10.51 4.10 10.26 3.99 10 3.99C9.73 3.99 9.48 4.10 9.29 4.29C9.10 4.47 9 4.73 9 4.99V7.58L4.70 3.29L4.63 3.22C4.43 3.06 4.19 2.98 3.94 3.00C3.70 3.01 3.46 3.11 3.29 3.29ZM19 13H13V19C13 19.26 13.10 19.51 13.29 19.70C13.48 19.89 13.73 20 14 20C14.26 20 14.51 19.89 14.70 19.70C14.89 19.51 15 19.26 15 19V16.41L19.29 20.70L19.36 20.77C19.56 20.92 19.80 21.00 20.04 20.99C20.29 20.98 20.52 20.87 20.70 20.70C20.87 20.52 20.98 20.29 20.99 20.04C21.00 19.80 20.92 19.56 20.77 19.36L20.70 19.29L16.41 15H19C19.26 15 19.51 14.89 19.70 14.70C19.89 14.51 20 14.26 20 14C20 13.73 19.89 13.48 19.70 13.29C19.51 13.10 19.26 13 19 13Z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  transform="scale(0.9)"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 3H3V10C3 10.26 3.10 10.51 3.29 10.70C3.48 10.89 3.73 11 4 11C4.26 11 4.51 10.89 4.70 10.70C4.89 10.51 5 10.26 5 10V6.41L9.29 10.70L9.36 10.77C9.56 10.92 9.80 11.00 10.04 10.99C10.29 10.98 10.52 10.87 10.70 10.70C10.87 10.52 10.98 10.29 10.99 10.04C11.00 9.80 10.92 9.56 10.77 9.36L10.70 9.29L6.41 5H10C10.26 5 10.51 4.89 10.70 4.70C10.89 4.51 11 4.26 11 4C11 3.73 10.89 3.48 10.70 3.29C10.51 3.10 10.26 3 10 3ZM20 13C19.73 13 19.48 13.10 19.29 13.29C19.10 13.48 19 13.73 19 14V17.58L14.70 13.29L14.63 13.22C14.43 13.07 14.19 12.99 13.95 13.00C13.70 13.01 13.47 13.12 13.29 13.29C13.12 13.47 13.01 13.70 13.00 13.95C12.99 14.19 13.07 14.43 13.22 14.63L13.29 14.70L17.58 19H14C13.73 19 13.48 19.10 13.29 19.29C13.10 19.48 13 19.73 13 20C13 20.26 13.10 20.51 13.29 20.70C13.48 20.89 13.73 21 14 21H21V14C21 13.73 20.89 13.48 20.70 13.29C20.51 13.10 20.26 13 20 13Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {title && (
        <div
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 transition-opacity duration-300 pointer-events-none ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <h2 className="text-white text-lg font-bold">{title}</h2>
        </div>
      )}
    </div>
  );
}
