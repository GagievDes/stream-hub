"use client";

import { useEffect, useState, type RefObject } from "react";
import { cueTextAt, type Cue } from "@/lib/tv-cues";

export function TvCueLine({
  cues,
  font,
  useVideo,
  videoRef,
  frameRef,
}: {
  cues: readonly Cue[];
  font: string;
  useVideo: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  frameRef: RefObject<HTMLIFrameElement | null>;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    const show = (time: number) => {
      const next = cueTextAt(cues, time);
      setText((current) => (current === next ? current : next));
    };

    if (useVideo) {
      const video = videoRef.current;
      if (!video) return;
      const onTime = () => show(video.currentTime || 0);
      video.addEventListener("timeupdate", onTime);
      return () => video.removeEventListener("timeupdate", onTime);
    }

    function onMessage(event: MessageEvent) {
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (!("event" in data) || data.event !== "frameXTV:timeupdate") return;
      if (!("currentTime" in data) || typeof data.currentTime !== "number") return;
      show(data.currentTime);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [cues, frameRef, useVideo, videoRef]);

  if (!text) return null;

  return (
    <p className="tv-cue" style={{ fontSize: font }}>
      {text}
    </p>
  );
}
