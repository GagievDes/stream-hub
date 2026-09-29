import type {
  CastMember,
  MediaDetails,
  MediaItem,
  MediaType,
  PersonCredit,
  PersonDetails,
  TvSeason,
} from "./types";

/** Curated titles with real TMDB IDs and poster paths for offline/demo mode. */
const movies: MediaDetails[] = [
  {
    id: 299536,
    title: "Avengers: Infinity War",
    overview:
      "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.",
    posterPath: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    backdropPath: "/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
    releaseDate: "2018-04-25",
    voteAverage: 8.2,
    mediaType: "movie",
    tagline: "An entire universe. Once and for all.",
    runtime: 149,
    genres: ["Adventure", "Action", "Science Fiction"],
    numberOfSeasons: null,
  },
  {
    id: 603,
    title: "The Matrix",
    overview:
      "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    posterPath: "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
    backdropPath: "/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg",
    releaseDate: "1999-03-31",
    voteAverage: 8.2,
    mediaType: "movie",
    tagline: "Welcome to the Real World.",
    runtime: 136,
    genres: ["Action", "Science Fiction"],
    numberOfSeasons: null,
  },
  {
    id: 550,
    title: "Fight Club",
    overview:
      "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    posterPath: "/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg",
    backdropPath: "/c6OLXfKAk5BKeR6broC8pYiCquX.jpg",
    releaseDate: "1999-10-15",
    voteAverage: 8.4,
    mediaType: "movie",
    tagline: "Mischief. Mayhem. Soap.",
    runtime: 139,
    genres: ["Drama"],
    numberOfSeasons: null,
  },
  {
    id: 157336,
    title: "Interstellar",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    posterPath: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    backdropPath: "/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
    releaseDate: "2014-11-05",
    voteAverage: 8.5,
    mediaType: "movie",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    runtime: 169,
    genres: ["Adventure", "Drama", "Science Fiction"],
    numberOfSeasons: null,
  },
  {
    id: 680,
    title: "Pulp Fiction",
    overview:
      "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    posterPath: "/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
    backdropPath: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    releaseDate: "1994-09-10",
    voteAverage: 8.5,
    mediaType: "movie",
    tagline: "Just because you are a character doesn't mean you have character.",
    runtime: 154,
    genres: ["Thriller", "Crime"],
    numberOfSeasons: null,
  },
  {
    id: 27205,
    title: "Inception",
    overview:
      "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: inception.",
    posterPath: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    backdropPath: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    releaseDate: "2010-07-15",
    voteAverage: 8.4,
    mediaType: "movie",
    tagline: "Your mind is the scene of the crime.",
    runtime: 148,
    genres: ["Action", "Science Fiction", "Adventure"],
    numberOfSeasons: null,
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview:
      "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdropPath: "/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg",
    releaseDate: "2008-07-16",
    voteAverage: 8.5,
    mediaType: "movie",
    tagline: "Welcome to a world without rules.",
    runtime: 152,
    genres: ["Drama", "Action", "Crime", "Thriller"],
    numberOfSeasons: null,
  },
  {
    id: 11,
    title: "Star Wars",
    overview:
      "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.",
    posterPath: "/fai0rspsNeJCS69wHNjOdWxcI7P.jpg",
    backdropPath: "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
    releaseDate: "1977-05-25",
    voteAverage: 8.2,
    mediaType: "movie",
    tagline: "A long time ago in a galaxy far, far away...",
    runtime: 121,
    genres: ["Adventure", "Action", "Science Fiction"],
    numberOfSeasons: null,
  },
];

const tvShows: MediaDetails[] = [
  {
    id: 1405,
    title: "Dexter",
    overview:
      "Dexter Morgan, a blood spatter pattern analyst for the Miami Metro Police also leads a secret life as a serial killer, bringing the criminals to justice that have slipped through the cracks.",
    posterPath: "/i8ORB1biusVy703lGxUi5Rle6zA.jpg",
    backdropPath: "/nS5ZSmrX92lu1GYAlXZye1mkDfd.jpg",
    releaseDate: "2006-10-01",
    voteAverage: 8.2,
    mediaType: "tv",
    tagline: "Look for the signs.",
    runtime: 55,
    genres: ["Crime", "Drama", "Mystery"],
    numberOfSeasons: 8,
  },
  {
    id: 1396,
    title: "Breaking Bad",
    overview:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    posterPath: "/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg",
    backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    releaseDate: "2008-01-20",
    voteAverage: 8.9,
    mediaType: "tv",
    tagline: "Change the equation.",
    runtime: 45,
    genres: ["Drama", "Crime"],
    numberOfSeasons: 5,
  },
  {
    id: 1399,
    title: "Game of Thrones",
    overview:
      "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
    posterPath: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdropPath: "/zZqpAXxVSBtxV9qPBcscfXBcL2w.jpg",
    releaseDate: "2011-04-17",
    voteAverage: 8.4,
    mediaType: "tv",
    tagline: "Winter is coming.",
    runtime: 60,
    genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
    numberOfSeasons: 8,
  },
  {
    id: 66732,
    title: "Stranger Things",
    overview:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    posterPath: "/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
    backdropPath: "/9P4IIMYY3HifqeruZq0ZZ9g7YUi.jpg",
    releaseDate: "2016-07-15",
    voteAverage: 8.6,
    mediaType: "tv",
    tagline: "The world is turning upside down.",
    runtime: 50,
    genres: ["Drama", "Mystery", "Sci-Fi & Fantasy"],
    numberOfSeasons: 5,
  },
  {
    id: 87108,
    title: "Chernobyl",
    overview:
      "The true story of one of the worst man-made catastrophes in history: the radioactive explosion at Chernobyl nuclear power station.",
    posterPath: "/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg",
    backdropPath: "/900tHlUYUkp7Ol04XFSoAaEIXcT.jpg",
    releaseDate: "2019-05-06",
    voteAverage: 8.6,
    mediaType: "tv",
    tagline: "What is the cost of lies?",
    runtime: 60,
    genres: ["Drama"],
    numberOfSeasons: 1,
  },
  {
    id: 94605,
    title: "Arcane",
    overview:
      "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
    posterPath: "/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    backdropPath: "/5cvnxEHT3e39DvT6ARw4GNCFrB0.jpg",
    releaseDate: "2021-11-06",
    voteAverage: 8.7,
    mediaType: "tv",
    tagline: "The divide between.",
    runtime: 40,
    genres: ["Animation", "Action & Adventure", "Sci-Fi & Fantasy"],
    numberOfSeasons: 2,
  },
  {
    id: 60625,
    title: "Rick and Morty",
    overview:
      "Rick is a mentally unhinged but scientifically gifted old man who has recently reconnected with his family. He spends most of his time dragging his young grandson Morty on dangerous, off-world adventures.",
    posterPath: "/owhkU6KRqdXoUQpjV8uyZGPtX58.jpg",
    backdropPath: "/5BDNWWHweQL0q1fmTv7gmRXfnl4.jpg",
    releaseDate: "2013-12-02",
    voteAverage: 8.7,
    mediaType: "tv",
    tagline: "Science hard.",
    runtime: 22,
    genres: ["Animation", "Comedy", "Sci-Fi & Fantasy"],
    numberOfSeasons: 8,
  },
  {
    id: 1418,
    title: "The Big Bang Theory",
    overview:
      "The sitcom is centered on five characters living in Pasadena, California: roommates Leonard Hofstadter and Sheldon Cooper; Penny, a waitress and aspiring actress who lives across the hall; and Leonard and Sheldon's equally geeky and socially awkward friends and co-workers.",
    posterPath: "/euKFiO5M125rpngFRBbSW83beeI.jpg",
    backdropPath: "/rwYvhVv0vwbulMwxOfEsuAr1JrT.jpg",
    releaseDate: "2007-09-24",
    voteAverage: 7.9,
    mediaType: "tv",
    tagline: "Smart. Funny. Geeky.",
    runtime: 22,
    genres: ["Comedy"],
    numberOfSeasons: 12,
  },
];

function catalog(type: MediaType): MediaDetails[] {
  return type === "movie" ? movies : tvShows;
}

function toItem(details: MediaDetails): MediaItem {
  return {
    id: details.id,
    title: details.title,
    overview: details.overview,
    posterPath: details.posterPath,
    backdropPath: details.backdropPath,
    releaseDate: details.releaseDate,
    voteAverage: details.voteAverage,
    mediaType: details.mediaType,
  };
}

export function mockPopular(type: MediaType): MediaItem[] {
  return catalog(type).map(toItem);
}

export function mockSearch(type: MediaType, query: string): MediaItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return mockPopular(type);
  return catalog(type)
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.overview.toLowerCase().includes(q),
    )
    .map(toItem);
}

export function mockDetails(
  type: MediaType,
  id: number,
): MediaDetails | null {
  return catalog(type).find((item) => item.id === id) ?? null;
}

export function isUsingMockData(): boolean {
  return !process.env.TMDB_API_KEY?.trim();
}

/** Simple episode lists for demo mode when TMDB key is missing. */
export function mockTvSeasons(id: number): TvSeason[] {
  const show = tvShows.find((item) => item.id === id);
  const seasonCount = show?.numberOfSeasons ?? 1;
  const episodesPerSeason = 8;

  return Array.from({ length: seasonCount }, (_, seasonIndex) => {
    const seasonNumber = seasonIndex + 1;
    const episodes = Array.from({ length: episodesPerSeason }, (_, epIndex) => {
      const episodeNumber = epIndex + 1;
      return {
        episodeNumber,
        name: `Episode ${episodeNumber}`,
      };
    });
    return {
      seasonNumber,
      name: `Season ${seasonNumber}`,
      episodeCount: episodes.length,
      episodes,
    };
  });
}

const mockPeople: Record<number, PersonDetails> = {
  53820: {
    id: 53820,
    name: "Michael C. Hall",
    biography:
      "American actor best known for playing Dexter Morgan in Dexter and David Fisher in Six Feet Under.",
    birthday: "1971-02-08",
    placeOfBirth: "Raleigh, North Carolina, USA",
    profilePath: "/7zUMGoujuev5PUwwv4Gl6ikB50k.jpg",
    knownForDepartment: "Acting",
  },
  53828: {
    id: 53828,
    name: "Jennifer Carpenter",
    biography: "American actress known for portraying Debra Morgan in Dexter.",
    birthday: "1979-12-07",
    placeOfBirth: "Louisville, Kentucky, USA",
    profilePath: "/sQeNgRFfCjt3EHMuaJBm8jRCLgw.jpg",
    knownForDepartment: "Acting",
  },
  6193: {
    id: 6193,
    name: "Leonardo DiCaprio",
    biography: "American actor and producer.",
    birthday: "1974-11-11",
    placeOfBirth: "Los Angeles, California, USA",
    profilePath: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
    knownForDepartment: "Acting",
  },
};

function buildMockCredits(): PersonCredit[] {
  return [
    ...movies.slice(0, 5).map((item) => ({ ...toItem(item), character: null })),
    ...tvShows.slice(0, 4).map((item) => ({ ...toItem(item), character: null })),
  ];
}

export function mockCast(type: MediaType, id: number): CastMember[] {
  if (type === "tv" && id === 1405) {
    return [
      {
        id: 53820,
        name: "Michael C. Hall",
        character: "Dexter Morgan",
        profilePath: "/7zUMGoujuev5PUwwv4Gl6ikB50k.jpg",
        order: 0,
      },
      {
        id: 53828,
        name: "Jennifer Carpenter",
        character: "Debra Morgan",
        profilePath: "/sQeNgRFfCjt3EHMuaJBm8jRCLgw.jpg",
        order: 1,
      },
    ];
  }
  if (type === "movie" && id === 27205) {
    return [
      {
        id: 6193,
        name: "Leonardo DiCaprio",
        character: "Dom Cobb",
        profilePath: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
        order: 0,
      },
    ];
  }
  return [];
}

export function mockPerson(id: number): PersonDetails | null {
  return mockPeople[id] ?? null;
}

export function mockPersonCredits(_id: number): PersonCredit[] {
  return buildMockCredits();
}
