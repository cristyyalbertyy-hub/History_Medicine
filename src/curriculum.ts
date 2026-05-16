import { publicAsset } from "./publicAsset";

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
          video: publicAsset("/AF_MAG_V.mp4"),
          podcast: publicAsset("/AF_MAG_P.m4a"),
          infographic: publicAsset("/AF_MAG_I.png"),
          questionnaire: publicAsset("/AF_MAG_Q.csv"),
        },
      },
      {
        id: "AF_HRM",
        title: "Hippocrates and Rational Medicine",
        assets: {
          video: publicAsset("/AF_HRM_V.mp4"),
          podcast: publicAsset("/AF_HRM_A.m4a"),
          infographic: publicAsset("/AF_HRM_I.png"),
          questionnaire: publicAsset("/AF_HRM_Q.csv"),
        },
      },
      {
        id: "AF_THM",
        title: "Theory of Humors",
        assets: {
          video: publicAsset("/AF_TH_V.mp4"),
          podcast: publicAsset("/AF_TH_P.m4a"),
          infographic: publicAsset("/AF_TH_I.png"),
          questionnaire: publicAsset("/AF_TH_Q.csv"),
        },
      },
      {
        id: "AF_ARI",
        title: "Aristotle",
        assets: {
          video: publicAsset("/AF_A_V.mp4"),
          podcast: publicAsset("/AF_A_P.m4a"),
          infographic: publicAsset("/AF_A_I.png"),
          questionnaire: publicAsset("/AF_A_Q.csv"),
        },
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
        assets: {
          video: publicAsset("/SA_SR_V.mp4"),
          podcast: publicAsset("/SA_SR_P.m4a"),
          infographic: publicAsset("/SA_SR_I.png"),
          questionnaire: publicAsset("/SA_SR_Q.csv"),
        },
      },
      {
        id: "SA_VES",
        title: "Andreas Vesalius and Dissection",
        assets: {
          video: publicAsset("/SA_AVD_V.mp4"),
          podcast: publicAsset("/SA_AVD_P.m4a"),
          infographic: publicAsset("/SA_AVD_I.png"),
          questionnaire: publicAsset("/SA_AVD_Q.csv"),
        },
      },
      {
        id: "SA_HAR",
        title: "William Harvey",
        assets: {
          video: publicAsset("/SA_WH_V.mp4"),
          podcast: publicAsset("/SA_WH_P.m4a"),
          infographic: publicAsset("/SA_WH_I.png"),
          questionnaire: publicAsset("/SA_WH_Q.csv"),
        },
      },
      {
        id: "SA_FLE",
        title: "Alexander Fleming",
        assets: {
          video: publicAsset("/SA_AF_V.mp4"),
          podcast: publicAsset("/SA_AF_P.m4a"),
          infographic: publicAsset("/SA_AF_I.png"),
          questionnaire: publicAsset("/SA_AF_Q.csv"),
        },
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
