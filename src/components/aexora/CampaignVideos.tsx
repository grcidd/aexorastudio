import { useEffect, useState } from "react";
import v1 from "@/assets/camp-01.mp4.asset.json";
import v2 from "@/assets/camp-02.mp4.asset.json";
import v3 from "@/assets/camp-03.mp4.asset.json";
import v4 from "@/assets/camp-04.mp4.asset.json";
import v5 from "@/assets/camp-05.mp4.asset.json";
import v6 from "@/assets/camp-06.mp4.asset.json";
import v7 from "@/assets/camp-07.mp4.asset.json";
import v8 from "@/assets/camp-08.mp4.asset.json";
import v9 from "@/assets/camp-09.mp4.asset.json";
import v10 from "@/assets/camp-10.mp4.asset.json";

export const campaignVideos = [
  v1.url, v2.url, v3.url, v4.url, v5.url,
  v6.url, v7.url, v8.url, v9.url, v10.url,
];

export function CampaignVideos({ opacity = "opacity-60" }: { opacity?: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % campaignVideos.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      {campaignVideos.map((u, i) => (
        <video
          key={u}
          src={u}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? opacity : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
