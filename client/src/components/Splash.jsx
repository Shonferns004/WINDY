import React, { useState, useEffect } from "react";

const SplashScreen = ({ onComplete }) => {
  // Tracks loading progress percentage
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing Core");

  // Messages shown as progress increases
  const statusMessages = [
    "Initializing Core...",
    "Syncing Satellite Uplink...",
    "System Ready.",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 8;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return 100;
        }

        const msgIndex = Math.floor((next / 100) * statusMessages.length);
        if (statusMessages[msgIndex]) setStatus(statusMessages[msgIndex]);

        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-mint flex flex-col items-center justify-center z-50 overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orbital-line w-[1000px] h-[1000px] opacity-10 border-leaf animate-[spin_60s_linear_infinite]"></div>
        <div className="orbital-line w-[700px] h-[700px] opacity-20 border-sage animate-[spin_40s_linear_infinite_reverse]"></div>
        <div className="orbital-line w-[400px] h-[400px] opacity-30 border-leaf animate-[spin_20s_linear_infinite]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="relative mb-12">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-leaf/20 relative z-20">
            <span className="material-symbols-outlined text-leaf text-6xl animate-pulse">
              cyclone
            </span>
          </div>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-leaf/20 animate-ping -z-10"></div>
        </div>

        {/* Text and Progress */}
        <div className="text-center max-w-xs w-full">
          <h1 className="text-4xl font-black tracking-[0.2em] text-moss uppercase mb-2">
            WINDY 
          </h1>
          <p className="text-[10px] font-extrabold text-leaf tracking-[0.5em] uppercase h-4 mb-10 transition-all duration-500">
            {status}
          </p>

          {/* Precision Progress Bar */}
          <div className="w-full h-1 bg-moss/5 rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full bg-leaf transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between mt-4 text-[9px] font-mono text-moss/40 uppercase tracking-widest">
            <span>windy.v1</span>
            <span>{Math.floor(progress)}% Complete</span>
          </div>
        </div>
      </div>

      {/* Decorative Branding */}
      <div className="absolute bottom-16 flex flex-col items-center opacity-20">
        <div className="w-[1px] h-12 bg-moss mb-4"></div>
        <span className="text-[10px] font-black tracking-[1em] uppercase text-moss">
          S H O N F E R N S
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
