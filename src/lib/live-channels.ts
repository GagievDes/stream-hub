export type LiveCategoryId = "news" | "business" | "science" | "sports";

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
  { id: "business", label: "Business" },
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
    id: "france-24-arabic",
    name: "France 24 Arabic",
    category: "news",
    region: "France",
    description: "France 24's Arabic-language international news.",
    streamUrl:
      "https://live.france24.com/hls/live/2037222/F24_AR_HI_HLS/master_900.m3u8",
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
    id: "dw-german",
    name: "DW Deutsch",
    category: "news",
    region: "Germany",
    description: "Deutsche Welle's German-language news channel.",
    streamUrl:
      "https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8",
  },
  {
    id: "dw-spanish",
    name: "DW Español",
    category: "news",
    region: "Germany",
    description: "Deutsche Welle's Spanish-language news channel.",
    streamUrl:
      "https://dwamdstream103.akamaized.net/hls/live/2015526/dwstream103/index.m3u8",
  },
  {
    id: "al-jazeera-english",
    name: "Al Jazeera English",
    category: "news",
    region: "Qatar",
    description: "Al Jazeera's English international news channel.",
    streamUrl: "https://live-hls-aje-ak.getaj.net/AJE/index.m3u8",
  },
  {
    id: "al-jazeera-arabic",
    name: "Al Jazeera Arabic",
    category: "news",
    region: "Qatar",
    description: "Al Jazeera's Arabic news channel.",
    streamUrl: "https://live-hls-web-aja.getaj.net/AJA/index.m3u8",
  },
  {
    id: "euronews-english",
    name: "Euronews English",
    category: "news",
    region: "France",
    description: "Euronews in English.",
    streamUrl: "https://cdn-euronews.akamaized.net/live/eds/euronews-en/25002/index.m3u8",
  },
  {
    id: "euronews-french",
    name: "Euronews French",
    category: "news",
    region: "France",
    description: "Euronews in French.",
    streamUrl: "https://cdn-euronews.akamaized.net/live/eds/euronews-fr/25026/index.m3u8",
  },
  {
    id: "africanews-english",
    name: "Africanews English",
    category: "news",
    region: "France",
    description: "Africanews, the African edition of Euronews, in English.",
    streamUrl: "https://cdn-euronews.akamaized.net/live/eds/africanews-en/25049/index.m3u8",
  },
  {
    id: "africanews-french",
    name: "Africanews French",
    category: "news",
    region: "France",
    description: "Africanews in French.",
    streamUrl: "https://cdn-euronews.akamaized.net/live/eds/africanews-fr/25050/index.m3u8",
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
    id: "sky-news-australia",
    name: "Sky News Australia",
    category: "news",
    region: "Australia",
    description: "Sky News Australia's public live stream.",
    streamUrl:
      "https://skynewsau-live.akamaized.net/hls/live/2002689/skynewsau-extra1/master.m3u8",
  },
  {
    id: "un-web-tv",
    name: "UN Web TV",
    category: "news",
    region: "International",
    description: "The United Nations public webcast.",
    streamUrl:
      "https://cdnapi.kaltura.com/p/2503451/sp/250345100/playManifest/entryId/1_gb6tjmle/format/applehttp/protocol/https/a.m3u8",
  },
  {
    id: "bloomberg-us",
    name: "Bloomberg TV",
    category: "business",
    region: "United States",
    description: "Bloomberg Television's U.S. live stream.",
    streamUrl: "https://www.bloomberg.com/media-manifest/streams/us.m3u8",
  },
  {
    id: "bloomberg-europe",
    name: "Bloomberg Europe",
    category: "business",
    region: "Europe",
    description: "Bloomberg Television's European live stream.",
    streamUrl: "https://www.bloomberg.com/media-manifest/streams/eu.m3u8",
  },
  {
    id: "bloomberg-asia",
    name: "Bloomberg Asia",
    category: "business",
    region: "Asia",
    description: "Bloomberg Television's Asian live stream.",
    streamUrl: "https://www.bloomberg.com/media-manifest/streams/asia.m3u8",
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
