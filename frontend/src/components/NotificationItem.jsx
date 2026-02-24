import { useRef, useEffect, useState } from "react";
import { markNotificationRead } from "../services/api";
import alarmSound from "../assets/alarm.mp3";

export default function NotificationItem({ notification, onRead }) {
  const alarmRef = useRef(null);
  const iconRef = useRef(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const levelStyles = {
    1: { color: "from-yellow-200 to-yellow-100", icon: "⏰", label: "Erinnerung" },
    2: { color: "from-orange-200 to-orange-100", icon: "⏰", label: "Zweite Erinnerung" },
    3: { 
  color: "from-red-200 to-red-100", 
  icon: "💊", 
  label: "Medikations-Alarm für Pflegedienst" 
},
  };

  const triggerReminder = (level) => {
    if (alarmRef.current && audioUnlocked) alarmRef.current.play();
    if (iconRef.current) {
      iconRef.current.classList.add("animate-ring");
      setTimeout(() => iconRef.current.classList.remove("animate-ring"), 4000);
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      if (alarmRef.current) {
        alarmRef.current.play().catch(() => {});
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
        setAudioUnlocked(true);
      }
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  useEffect(() => {
    if (!notification.read && audioUnlocked) triggerReminder(notification.level);
  }, [notification, audioUnlocked]);

  const handleClick = async () => {
    if (!notification.read) {
      await markNotificationRead(notification.id);
      onRead(notification.id);
    }
  };

  const level = levelStyles[notification.level] || {};

  return (
<div
  onClick={handleClick}
  className={`
    relative flex items-start gap-4 p-4 rounded-[28px] cursor-pointer
    bg-white/70 backdrop-blur-xl border border-white/30
    shadow-[0_10px_30px_rgba(0,0,0,0.05)]
    hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]
    transition-all duration-200
    ${!notification.read ? "font-semibold ring-2 ring-red-400 animate-pulse" : "opacity-60"}
  `}
>
  {/* Accent gradient line */}
  <div className={`absolute left-0 top-0 h-full w-1 rounded-l-[28px] bg-gradient-to-b ${level.color}`} />

  {/* Icon */}
  <span
    ref={iconRef}
    className={`text-xl flex-shrink-0 ${!notification.read ? "text-red-600 animate-pulse" : ""}`}
  >
    {level.icon}
  </span>

  {/* Text */}
  <div className="flex flex-col gap-1">
    <div className="text-xs text-gray-500">{level.label}</div>
    <div className="text-sm text-gray-800">{notification.message}</div>
  </div>

  {/* Audio */}
  <audio ref={alarmRef} src={alarmSound} preload="auto" />
</div>

  );
}
