export type LiveCategoryId = "news" | "science" | "sports";

export type LiveChannel = {
  id: string;
  name: string;
  category: LiveCategoryId;
  region: string;
  description: string;
  streamUrl: string;
};

export const LIVE_CATEGORIES: { id: LiveCategoryId; label: string }[] = [
  { id: "news", label: "News" },
  { id: "science", label: "Science & nature" },
  { id: "sports", label: "Sports" },
];

/** Public live streams published by the broadcasters themselves. */
export const LIVE_CHANNELS: LiveChannel[] = [
  {
    id: "france-24-english",
    name: "France 24 English",
    category: "news",
    region: "France",
    description: "International news in English from France Médias Monde.",
    streamUrl:
      "https://live.france24.com/hls/live/2037218/F24_EN_HI_HLS/master_900.m3u8",
  },
  {
    id: "france-24-french",
    name: "France 24 French",
    category: "news",
    region: "France",
    description: "France 24's French-language international news.",
    streamUrl:
      "https://live.france24.com/hls/live/2037179/F24_FR_HI_HLS/master_900.m3u8",
  },
  {
    id: "france-24-spanish",
    name: "France 24 Español",
    category: "news",
    region: "France",
    description: "France 24's Spanish-language international news.",
    streamUrl:
      "https://live.france24.com/hls/live/2037220/F24_ES_HI_HLS/master_900.m3u8",
  },
  {
    id: "dw-english",
    name: "DW English",
    category: "news",
    region: "Germany",
    description: "Deutsche Welle's public English news channel.",
    streamUrl:
      "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
  },
  {
    id: "nhk-world",
    name: "NHK World-Japan",
    category: "news",
    region: "Japan",
    description: "NHK's free international English channel.",
    streamUrl: "https://masterpl.hls.nhkworld.jp/hls/w/live/smarttv.m3u8",
  },
  {
    id: "trt-world",
    name: "TRT World",
    category: "news",
    region: "Turkey",
    description: "TRT's English-language international news.",
    streamUrl: "https://tv-trtworld.medya.trt.com.tr/master_1080.m3u8",
  },
  {
    id: "cna",
    name: "CNA",
    category: "news",
    region: "Singapore",
    description: "Channel NewsAsia's live international bulletin.",
    streamUrl:
      "https://d2e1asnsl7br7b.cloudfront.net/7782e205e72f43aeb4a48ec97f66ebbe/index_5.m3u8",
  },
  {
    id: "arirang",
    name: "Arirang",
    category: "news",
    region: "South Korea",
    description: "Arirang TV's public international service.",
    streamUrl:
      "https://amdlive-ch01-ctnd-com.akamaized.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8",
  },
  {
    id: "wildearth",
    name: "WildEarth",
    category: "science",
    region: "South Africa",
    description: "Live wildlife safaris from WildEarth.",
    streamUrl: "https://wildearth-plex.amagi.tv/masterR1080p.m3u8",
  },
  {
    id: "red-bull-tv",
    name: "Red Bull TV",
    category: "sports",
    region: "Austria",
    description: "Red Bull TV's free sports and adventure channel.",
    streamUrl:
      "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_3360.m3u8",
  },
];

export function liveChannelById(id: string | null): LiveChannel | null {
  if (!id) return null;
  return LIVE_CHANNELS.find((channel) => channel.id === id) ?? null;
}
