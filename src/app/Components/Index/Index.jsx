"use client";
import { Typewriter } from "react-simple-typewriter";
import { useRouter } from "next/navigation";
import Particles from "../Etc/Particles";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Index() {
  const route = useRouter();
  const [currentUser, setCurrentUser] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomedSrc, setZoomedSrc] = useState("");
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/validate", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.valid) setCurrentUser(data.username);
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  const handleZoom = (src) => {
    setZoomedSrc(src);
    setZoomed(true);
  };

  const handleCloseZoom = () => setZoomed(false);

  return (
    <div className="h-full w-full mt-30 z-100">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <div className="flex items-center justify-between mx-30 max-md:mx-0 max-md:flex-col">
        <div className="flex flex-col items-start">
          <h1 className="text-4xl font-bold mb-1 text-white max-md:w-full max-md:text-center">
            MidDrive
          </h1>
          <p className="text-neutral-400 text-[18px] mb-4 font-bold">
            #1 video provider to
            <span className="text-white font-bold">
              <Typewriter
                words={[" upload", " watch", " share"]}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={100}
                delaySpeed={1000}
              />
            </span>
          </p>
          <div className="flex gap-2 items-center justify-center">
            <button className="flex items-center justify-center bg-white text-black font-bold text-[14px] px-12 py-2 rounded hover:bg-white/80">
              Docs
            </button>
            <button
              onClick={() => {
                if (currentUser) route.push("/upload");
                else window.dispatchEvent(new CustomEvent("open-login-modal"));
              }}
              className="flex items-center justify-center bg-[#0a0a0a] text-white font-bold text-[14px] px-8 py-2 rounded hover:bg-[#0a0a0a]/80"
            >
              Upload
            </button>
          </div>
        </div>
        <img
          src="https://i.imgur.com/tvpjrD0.png"
          className="w-[600px] h-auto max-md:mx-4 max-md:w-[350px] max-md:mt-10 hover:rotate-1 transition-all duration-300"
          alt=""
          onClick={() => handleZoom("https://i.imgur.com/tvpjrD0.png")}
        />
      </div>
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center z-50 cursor-zoom-out"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 0.5px, transparent 1px, transparent 15px)",
            }}
            onClick={handleCloseZoom}
          >
            <motion.img
              src={zoomedSrc}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
              alt=""
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col gap-10 items-center justify-center mb-0 border-b pb-10 border-transparent [border-image:linear-gradient(90deg,#0000_14%,#38393c,#0000_86%)_1]">
        <div className="absolute left-[-200px] top-1/2 -translate-y-1/3 w-[300px] h-[400px] rounded-full blur-3xl bg-white/10 -z-10 max-md:hidden"></div>
        <div className="zoomable mt-20 max-w-2xl flex flex-col text-center">
          <h3 className="font-bold text-3xl">Upload your own content</h3>
          <p className="mt-2 text-neutral-400 text-[16px]">
            MidDrive makes it easy to upload your own videos and share them with
            the world.
          </p>
        </div>
        <div className="flex gap-2 items-center justify-center max-md:flex-col max-md:mx-2">
          <div className="zoomable flex items-center justify-center">
            <div className="bg-[#0a0a0a] hover:bg-[#171717] text-white rounded p-4">
              <h2 className="font-bold mb-2 text-lg">Quick Uploads</h2>
              <p className="text-neutral-400 max-w-100">
                Upload videos in minutes with our simple and intuitive upload
                interface.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="zoomable bg-[#0a0a0a] hover:bg-[#171717] text-white rounded p-8 max-md:p-4">
              <h2 className="font-bold mb-2 text-lg">Embed Our Videos</h2>
              <p className="text-neutral-400 max-w-100">
                Easily embed videos hosted on MidDrive to your own website or
                blog with our embed code generator. You can also embed vanilla
                links, to use your own player.
              </p>
            </div>
          </div>
          <div className="zoomable flex items-center justify-center">
            <div className="text-white bg-[#0a0a0a] hover:bg-[#171717] rounded p-4">
              <h2 className="font-bold mb-2 text-lg">Fast Support</h2>
              <p className="text-neutral-400 max-w-100">
                Our support team is here to help you with any questions or
                issues you may have.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-b pb-10 mb-10 border-transparent [border-image:linear-gradient(90deg,#0000_14%,#38393c,#0000_86%)_1]">
        <div className="absolute right-[-200px] top-1/2 -translate-y-1/2 w-[300px] h-[400px] rounded-full blur-3xl bg-white/10 -z-10 max-md:hidden"></div>

        <div className="flex items-center justify-center gap-24 max-md:flex-col max-md:mx-4 max-md:gap-10">
          <div className="flex flex-col items-center justify-center max-w-md">
            <h3 className="text-3xl font-bold w-full text-left mb-2">
              Fast, Reliable Streaming
            </h3>
            <p className="max-w-md text-justify text-neutral-400 max-md:text-justify">
              Built for speed and reliability. Watch videos in HD without
              buffering, and enjoy features designed for modern viewers.
            </p>
          </div>
          <div className="p-8 text-white max-md:p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto skew-x-[-5deg] max-md:skew-x-0 max-md:max-w-full">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">HD Quality</h2>
                <p className="text-neutral-400 max-md:text-justify">
                  Stream videos in crisp HD quality for the best viewing
                  experience.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold max-md:text-right ">
                  Global CDN
                </h2>
                <p className="text-neutral-400 max-md:text-justify">
                  Our global CDN ensures fast load times and minimal buffering,
                  no matter where you are.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Easy Sharing</h2>
                <p className="text-neutral-400 max-md:text-justify">
                  Share your favorite videos with friends and family using easy
                  share links.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold max-md:text-right">
                  Cross-Platform
                </h2>
                <p className="text-neutral-400 max-md:text-justify">
                  Enjoy seamless playback across all your devices, from desktop
                  to mobile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-5 w-full">
        <div className="flex items-center justify-center">
          <p className="text-white font-bold text-center mx-4">
            This website is private and requires an invitation code. If you came
            across this site without prior knowledge, you won’t be able to
            access any of its features.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Index;
