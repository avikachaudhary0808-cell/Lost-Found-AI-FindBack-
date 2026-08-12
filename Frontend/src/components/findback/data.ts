export type MatchItem = {
  id: string;
  name: string;
  category: string;
  area: string;
  reported: string;
  match: number;
  badges: { label: string; tone: "lime" | "teal" | "amber" }[];
  hue: string;
};

export const potentialMatches: MatchItem[] = [
  {
    id: "FB-2291",
    name: "Black Samsung Smartphone",
    category: "Electronics",
    area: "Near MIET Campus",
    reported: "26 min ago",
    match: 91,
    badges: [
      { label: "High Match", tone: "lime" },
      { label: "Nearby", tone: "teal" },
    ],
    hue: "185",
  },
  {
    id: "FB-2287",
    name: "Blue Canvas Backpack",
    category: "Bags",
    area: "Metro Gate 3, Sector 18",
    reported: "1 hr ago",
    match: 84,
    badges: [{ label: "Nearby", tone: "teal" }],
    hue: "230",
  },
  {
    id: "FB-2284",
    name: "Student ID Card",
    category: "Documents",
    area: "Central Library Desk",
    reported: "2 hrs ago",
    match: 96,
    badges: [
      { label: "High Match", tone: "lime" },
      { label: "Verify", tone: "amber" },
    ],
    hue: "150",
  },
  {
    id: "FB-2280",
    name: "Wireless Earbuds (White)",
    category: "Electronics",
    area: "City Bus Route 14",
    reported: "3 hrs ago",
    match: 73,
    badges: [{ label: "Recent", tone: "teal" }],
    hue: "195",
  },
  {
    id: "FB-2276",
    name: "Black Leather Wallet",
    category: "Personal",
    area: "Riverside Cafe, Old Town",
    reported: "5 hrs ago",
    match: 88,
    badges: [
      { label: "High Match", tone: "lime" },
      { label: "Recent", tone: "teal" },
    ],
    hue: "40",
  },
  {
    id: "FB-2271",
    name: "Silver Keyring, 3 Keys",
    category: "Keys",
    area: "North Parking Lot B",
    reported: "8 hrs ago",
    match: 67,
    badges: [{ label: "Nearby", tone: "teal" }],
    hue: "210",
  },
];

export const steps = [
  {
    no: "01",
    title: "Report",
    body: "Tell us what you lost or found. A photo, a few words and a location is enough to start.",
  },
  {
    no: "02",
    title: "AI Match",
    body: "FindBack compares images, descriptions, location and time across every open report.",
  },
  {
    no: "03",
    title: "Recover",
    body: "Verify ownership and safely reconnect the item with its owner — no public exposure.",
  },
];

export const verificationFlow = [
  {
    title: "Potential Match Found",
    body: "Two independent reports align above the confidence threshold.",
  },
  {
    title: "Private Ownership Questions",
    body: "Only the true owner can answer details never shown in the listing.",
  },
  {
    title: "Identity & Item Verification",
    body: "Serial marks, wear patterns and account signals are cross-checked.",
  },
  {
    title: "Safe Recovery",
    body: "A neutral handover point is proposed. Contact details stay masked.",
  },
];
