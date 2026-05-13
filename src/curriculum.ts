export type TopicAssets = {
  video: string;
  podcast: string;
  infographic: string;
  questionnaire: string;
};

export type LeafTopic = {
  id: string;
  title: string;
  assets: TopicAssets | null;
};

export type Branch = {
  id: string;
  title: string;
  topics: LeafTopic[];
};

export const branches: Branch[] = [
  {
    id: "ancient",
    title: "Ancient Foundations",
    topics: [
      {
        id: "AF_MAG",
        title: "Medicine of Ancient Greece",
        assets: {
          video: "/AF_MAG_V.mp4",
          podcast: "/AF_MAG_P.m4a",
          infographic: "/AF_MAG_I.png",
          questionnaire: "/AF_MAG_Q.csv",
        },
      },
      {
        id: "AF_HRM",
        title: "Hippocrates and Rational Medicine",
        assets: {
          video: "/AF_HRM_V.mp4",
          podcast: "/AF_HRM_A.m4a",
          infographic: "/AF_HRM_I.png",
          questionnaire: "/AF_HRM_Q.csv",
        },
      },
      {
        id: "AF_THM",
        title: "Theory of Humors",
        assets: null,
      },
      {
        id: "AF_ARI",
        title: "Aristotle",
        assets: null,
      },
    ],
  },
  {
    id: "scientific",
    title: "Scientific Advancement",
    topics: [
      {
        id: "SA_SRE",
        title: "Scientific Revolution",
        assets: null,
      },
      {
        id: "SA_VES",
        title: "Andreas Vesalius and Dissection",
        assets: null,
      },
      {
        id: "SA_HAR",
        title: "William Harvey",
        assets: null,
      },
      {
        id: "SA_FLE",
        title: "Alexander Fleming",
        assets: null,
      },
    ],
  },
  {
    id: "public",
    title: "Public Health",
    topics: [
      {
        id: "PH_JEN",
        title: "Edward Jenner and Vaccines",
        assets: null,
      },
      {
        id: "PH_SEM",
        title: "Ignaz Semmelweis",
        assets: null,
      },
      {
        id: "PH_MGE",
        title: "Medical Geography",
        assets: null,
      },
      {
        id: "PH_SNO",
        title: "John Snow and Cholera",
        assets: null,
      },
    ],
  },
];
