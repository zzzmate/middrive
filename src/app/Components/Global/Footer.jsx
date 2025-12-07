"use client";

import { SiDiscord, SiFacebook, SiSteam, SiTiktok } from "react-icons/si";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
function Footer() {
  const router = useRouter();
  const [year, setYear] = useState(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="w-full bg-[#050505] text-white py-6 mt-12 border-t border-transparent [border-image:linear-gradient(90deg,#0000_14%,#38393c,#0000_86%)_1] px-5 sm:px-8 md:px-12 lg:px-25">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="w-full flex flex-col md:w-1/2">
          <p className="text-sm font-semibold mb-4">
            {" "}
            <img
              src="https://i.imgur.com/tz1weFW.png"
              className="h-9 object-contain p-1 text-white cursor-pointer"
              alt="Logo"
              onClick={() => router.push("/")}
            />
          </p>
          <span className="text-[13px] max-w-[840px] text-neutral-400 max-md:max-w-full">
            Please note: MidDrive operates as a video hosting provider. All
            content uploaded to our platform is managed in accordance with
            Hungarian law. If you believe that any content violates your rights,
            you may submit a removal request, and we will process it promptly
            according to the applicable regulations.
          </span>
        </div>

        <div className="flex w-full md:w-1/2 justify-start md:justify-end gap-12 sm:gap-16">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold">Website</span>
            <a
              className="text-[13px] text-neutral-400 hover:text-white"
              href="#"
              onClick={() => router.push("/")}
            >
              MidDrive
            </a>
            <a
              className="text-[13px] text-neutral-400 hover:text-white"
              onClick={() => router.push("/dashboard/")}
            >
              Dashboard
            </a>
          </div>

          <div className="flex flex-col">
            <span className="text-[13px] font-semibold">Resources</span>
            <a
              className="text-[13px] text-neutral-400 hover:text-white"
              href="#"
            >
              DMCA
            </a>{" "}
            <a
              className="text-[13px] text-neutral-400 hover:text-white"
              href="#"
            >
              Terms of use
            </a>
          </div>
        </div>
      </div>

      <div className="w-full border-t-1 border-transparent [border-image:linear-gradient(90deg,#0000_14%,#38393c,#0000_86%)_1] mt-6 pt-4 flex flex-col md:flex-row items-center justify-between text-[12px] text-neutral-400">
        <span>
          {year ?? ""} MidDrive™ | Made by:{" "}
          <a
            target="_blank"
            href="https://zzzmate.hu"
            className="text-white hover:underline"
          >
            zzzmate
          </a>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
