export type CowStatus = "Milking" | "Pregnant" | "Dry" | "Calf" | "Bull" | "Deceased" | "Donated Out";
export type CowSource = "Natural Birth" | "Donated" | "Sperm Donation" | "Purchased";

export interface BreedScore {
  headShape: number;
  hornCurvature: number;
  earShape: number;
  humpSize: number;
  dewlap: number;
  bodyFrame: number;
  udderShape: number;
  coatColor: number;
  tailLength: number;
  overallConformation: number;
}

export interface MilkRecord {
  month: string;
  year: number;
  liters: number;
  belowThreshold?: boolean;
}

export interface WeightRecord {
  month: string;
  year: number;
  kg: number;
  belowThreshold?: boolean;
}

export interface Cow {
  id: string;
  name: string;
  tagNumber: string;
  breed: "Gir";
  dateOfBirth: string;
  gender: "Female" | "Male";
  weight: number;
  source: CowSource;
  status: CowStatus;
  motherId: string | null;
  fatherId: string | null;
  image: string;
  milkOutput: MilkRecord[];
  weightHistory: WeightRecord[];
  healthStatus: "Healthy" | "Under Treatment" | "Vaccinated";
  lastVaccination: string;
  nextVaccination: string;
  dailyMilk: number;
  notes: string;
  generation: number;
  breedScore: BreedScore;
  totalBreedScore: number;
  milkThreshold: number;
  weightThreshold: number;
  gestationMonths: number | null;
  expectedDeliveryDate: string | null;
  lastCalvingDate: string | null;
  totalCalves: number;
  lactationMonthsSinceCalving: number | null;
  dateOfPassing: string | null;
  causeOfDeath: string | null;
  yearsOfService: number | null;
  lifetimeMilkLiters: number | null;
  memorialNote: string | null;
}

export interface Alert {
  id: string;
  cowId: string;
  cowName: string;
  type: "Vaccination" | "Health Check" | "Deworming" | "Breeding" | "Weight Check";
  dueDate: string;
  status: "Pending" | "Overdue" | "Completed";
  description: string;
  priority: "High" | "Medium" | "Low";
}

export interface TimelineEvent {
  year: number;
  incoming: number;
  outgoing: number;
  net: number;
  events: { type: "birth" | "donated_in" | "sperm_donation" | "donated_out" | "deceased" | "purchased"; cowName: string; date: string; month: number }[];
}

export interface DonationContact {
  name: string;
  organization: string;
  district: string;
  phone: string;
  pocName: string;
  pocPhone: string;
}

export interface DonationRecord {
  id: string;
  cowId: string | null;
  cowName: string;
  cowImage: string;
  cowGender: "Female" | "Male";
  cowTagNumber: string;
  type: "Donated In" | "Donated Out";
  date: string;
  contact: DonationContact;
  ageAtDonation: string;
  weightAtDonation: number;
  healthAtDonation: string;
  breedCertified: boolean;
  remarks: string;
  currentUpdate: string | null;
  lastUpdateDate: string | null;
}

const COW_IMAGES = [
  "https://images.unsplash.com/photo-1596522868827-678785f7cd45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGaXIlMjBjb3clMjBicmVlZCUyMEluZGlhfGVufDF8fHx8MTc3MjAwMTM3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1585008069473-3d57a46c88d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBjb3clMjBzaWRlJTIwcHJvZmlsZXxlbnwxfHx8fDE3NzIwMDEzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1724746010318-1a7c54db9130?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwY2FsZiUyMGJyb3dufGVufDF8fHx8MTc3MTkyMDYwOXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1668340841678-c10afca3799d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3clMjBzdGFuZGluZyUyMGZpZWxkJTIwc3VubGlnaHR8ZW58MXx8fHwxNzcyMDAxMzc0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1750256313911-7c8f7347cf73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWxsJTIwY2F0dGxlJTIwc3Ryb25nfGVufDF8fHx8MTc3MjAwMTM3NXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1589825743136-04dd871e49b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBicm93biUyMGNvdyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjAwMTM3NXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1660580954016-f81f6d6c4eb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3clMjBncmF6aW5nJTIwZ3JlZW4lMjBwYXN0dXJlfGVufDF8fHx8MTc3MjAwMTM3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1602612142828-23adc1365958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxmJTIwbmV3Ym9ybiUyMGZhcm18ZW58MXx8fHwxNzcyMDAxMzc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1722372088297-845cbc5e9197?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBjb3clMjBicm93biUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjAwMDM1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1763396504693-d6cbf7a14f89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGNvdyUyMEluZGlhbiUyMHJ1cmFsfGVufDF8fHx8MTc3MjAwMDM1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1739066112462-19d40a86a0af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3clMjBjYWxmJTIwZmFybSUyMEluZGlhfGVufDF8fHx8MTc3MjAwMDM1OHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1645971485561-c2c24f0a2cf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3clMjBmYWNlJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzIwMDAzNjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

// const COW_IMAGES = [
//   "https://plus.unsplash.com/premium_photo-1668446123344-d7945fb07eaa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y293fGVufDB8fDB8fHww",
//   "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y293fGVufDB8fDB8fHww",
//   "https://images.unsplash.com/photo-1564085352725-08da0272627d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y293fGVufDB8fDB8fHww",
//   "https://plus.unsplash.com/premium_photo-1677850455009-d67da2b774c9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGNvd3xlbnwwfHwwfHx8MA%3D%3D",
//   "https://images.unsplash.com/photo-1595365691689-6b7b4e1970cf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNvd3xlbnwwfHwwfHx8MA%3D%3D",
//   "https://images.unsplash.com/photo-1593768697824-f31b967e6c55?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNvd3xlbnwwfHwwfHx8MA%3D%3D",
//   "https://plus.unsplash.com/premium_photo-1677850452987-d3ff550db018?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fGNvd3xlbnwwfHwwfHx8MA%3D%3D",
//   "https://images.unsplash.com/photo-1604860428762-f55cea62b7a0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNvd3xlbnwwfHwwfHx8MA%3D%3D",
//   "https://plus.unsplash.com/premium_photo-1668446123130-24f03283b571?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGNvd3xlbnwwfHwwfHx8MA%3D%3D",
//   "https://images.unsplash.com/photo-1607771459220-36163d88974c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fGNvd3xlbnwwfHwwfHx8MA%3D%3D",
//   "https://images.unsplash.com/photo-1594661387748-1155d9a8c7a6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fGNvd3xlbnwwfHwwfHx8MA%3D%3D",
// ];

const FEMALE_NAMES = [
  "Kamdhenu", "Lakshmi", "Gauri", "Parvati", "Radha", "Sita", "Durga", "Ganga", "Saraswati", "Annapurna",
  "Tulsi", "Meera", "Rukmini", "Savitri", "Draupadi", "Mandira", "Chandni", "Nandini", "Rohini", "Revati",
  "Kalyani", "Sundari", "Madhuri", "Devika", "Anjali", "Priya", "Shobha", "Rani", "Malti", "Padma",
  "Champa", "Kesar", "Gulabi", "Hira", "Moti", "Basanti", "Roshni", "Jyoti", "Surekha", "Nirmala",
  "Varsha", "Komal", "Sneha", "Pooja", "Asha", "Nisha", "Tara", "Kavita", "Lata", "Uma",
  "Shanti", "Pushpa", "Rekha", "Kiran", "Neha", "Deepa", "Maya", "Sarla", "Geeta", "Mamta",
  "Veena", "Rupa", "Amrita", "Chitra", "Damini", "Esha", "Falguni", "Hema", "Indira", "Janki",
  "Kunti", "Leela", "Mitali", "Nalini", "Ojaswi", "Pallavi", "Rachna", "Sandhya", "Tanvi", "Urvashi",
  "Vidya", "Yamini", "Aisha", "Bhavna", "Chhaya", "Diya", "Ekta", "Gouri", "Harini", "Ishani",
  "Jayanti", "Kalpana", "Lavanya", "Manisha", "Nandita", "Omisha", "Pragya", "Ritu", "Suhani", "Trisha",
];

const MALE_NAMES = [
  "Nandi", "Shiva", "Krishna", "Bhola", "Gopal", "Shankar", "Balram", "Arjun", "Keshav", "Mohan",
  "Rajan", "Vijay", "Kanha", "Madhu", "Surya", "Chandra", "Rudra", "Dhruv", "Lakhan",
  "Girdhar", "Hari", "Jagdish", "Kishan", "Murli", "Narayan", "Omkar", "Prem", "Raghav", "Sameer",
  "Tushar", "Udai", "Vishal", "Yash", "Amar", "Bheem", "Chintu", "Devraj", "Gaurav", "Hemant",
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => +(rand() * (max - min) + min).toFixed(1);
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

function generateBreedScore(quality: "excellent" | "good" | "average" | "young"): BreedScore {
  const ranges: Record<string, [number, number]> = {
    excellent: [7.5, 10],
    good: [6, 8.5],
    average: [4.5, 7],
    young: [3, 6],
  };
  const [min, max] = ranges[quality];
  const score = (): number => +randFloat(min, max);
  return {
    headShape: score(),
    hornCurvature: score(),
    earShape: score(),
    humpSize: score(),
    dewlap: score(),
    bodyFrame: score(),
    udderShape: score(),
    coatColor: score(),
    tailLength: score(),
    overallConformation: score(),
  };
}

function totalScore(bs: BreedScore): number {
  const vals = Object.values(bs);
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generateMilkHistory(dailyAvg: number, threshold: number, years: number): MilkRecord[] {
  const records: MilkRecord[] = [];
  for (let y = 2025 - years + 1; y <= 2026; y++) {
    const maxM = y === 2026 ? 2 : 12;
    for (let m = 0; m < maxM; m++) {
      const seasonal = Math.sin((m / 12) * Math.PI * 2) * 1.5;
      const variation = randFloat(-2, 2);
      const liters = +(dailyAvg + seasonal + variation).toFixed(1);
      const val = Math.max(0.5, liters);
      records.push({
        month: MONTHS[m],
        year: y,
        liters: val,
        belowThreshold: val < threshold,
      });
    }
  }
  return records;
}

function generateWeightHistory(currentWeight: number, ageYears: number): WeightRecord[] {
  const records: WeightRecord[] = [];
  const startWeight = ageYears > 3 ? currentWeight - randInt(30, 80) : currentWeight - randInt(50, 150);
  const years = Math.min(ageYears, 4);
  let w = Math.max(40, startWeight);
  for (let y = 2026 - years; y <= 2026; y++) {
    const maxM = y === 2026 ? 2 : 12;
    for (let m = 0; m < maxM; m++) {
      w += randFloat(-2, 5);
      w = Math.max(30, w);
      records.push({
        month: MONTHS[m],
        year: y,
        kg: +w.toFixed(0),
      });
    }
  }
  return records;
}

function applyWeightThresholds(records: WeightRecord[], threshold: number): WeightRecord[] {
  return records.map(r => ({ ...r, belowThreshold: r.kg < threshold }));
}

interface CowGenConfig {
  id: string;
  name: string;
  gender: "Female" | "Male";
  dob: string;
  source: CowSource;
  motherId: string | null;
  fatherId: string | null;
  generation: number;
  status: CowStatus;
}

function generateCows(): Cow[] {
  const configs: CowGenConfig[] = [];
  let cowId = 1;
  let femaleNameIdx = 0;
  let maleNameIdx = 0;

  const getName = (gender: "Female" | "Male"): string => {
    if (gender === "Female") {
      const name = FEMALE_NAMES[femaleNameIdx % FEMALE_NAMES.length];
      femaleNameIdx++;
      return femaleNameIdx > FEMALE_NAMES.length ? `${name}-${Math.floor(femaleNameIdx / FEMALE_NAMES.length)}` : name;
    } else {
      const name = MALE_NAMES[maleNameIdx % MALE_NAMES.length];
      maleNameIdx++;
      return maleNameIdx > MALE_NAMES.length ? `${name}-${Math.floor(maleNameIdx / MALE_NAMES.length)}` : name;
    }
  };

  const getTag = (id: number) => `SN-${String(id).padStart(3, "0")}`;
  const getDate = (year: number) => {
    const m = randInt(1, 12);
    const d = randInt(1, 28);
    return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const gen0Females: string[] = [];
  const gen0Males: string[] = [];
  for (let i = 0; i < 20; i++) {
    const gender: "Female" | "Male" = i < 14 ? "Female" : "Male";
    const id = `c${cowId}`;
    configs.push({
      id,
      name: getName(gender),
      gender,
      dob: getDate(randInt(2013, 2017)),
      source: "Donated",
      motherId: null,
      fatherId: null,
      generation: 0,
      status: gender === "Male" ? "Bull" : (i < 10 ? "Milking" : (i < 12 ? "Dry" : "Milking")),
    });
    if (gender === "Female") gen0Females.push(id);
    else gen0Males.push(id);
    cowId++;
  }

  const gen1Females: string[] = [];
  const gen1Males: string[] = [];
  for (let i = 0; i < 40; i++) {
    const gender: "Female" | "Male" = i < 30 ? "Female" : "Male";
    const id = `c${cowId}`;
    const mother = pick(gen0Females);
    const sourceType: CowSource = randInt(0, 10) < 6 ? "Natural Birth" : (randInt(0, 10) < 7 ? "Purchased" : "Donated");
    const father = sourceType === "Natural Birth" ? pick(gen0Males) : null;
    const status: CowStatus = gender === "Male" ? "Bull" :
      (i < 20 ? "Milking" : (i < 25 ? "Pregnant" : (i < 28 ? "Dry" : "Milking")));
    configs.push({
      id, name: getName(gender), gender,
      dob: getDate(randInt(2017, 2020)),
      source: sourceType,
      motherId: sourceType === "Donated" ? null : mother,
      fatherId: father,
      generation: 1,
      status,
    });
    if (gender === "Female") gen1Females.push(id);
    else gen1Males.push(id);
    cowId++;
  }

  const gen2Females: string[] = [];
  const gen2Males: string[] = [];
  const allMales = [...gen0Males, ...gen1Males];
  for (let i = 0; i < 60; i++) {
    const gender: "Female" | "Male" = i < 48 ? "Female" : "Male";
    const id = `c${cowId}`;
    const mother = pick([...gen0Females, ...gen1Females]);
    const sourceType: CowSource = randInt(0, 10) < 5 ? "Natural Birth" : "Sperm Donation";
    const father = sourceType === "Natural Birth" ? pick(allMales) : null;
    const status: CowStatus = gender === "Male" ? "Bull" :
      (i < 30 ? "Milking" : (i < 40 ? "Pregnant" : (i < 45 ? "Dry" : "Milking")));
    configs.push({
      id, name: getName(gender), gender,
      dob: getDate(randInt(2020, 2023)),
      source: sourceType,
      motherId: mother,
      fatherId: father,
      generation: 2,
      status,
    });
    if (gender === "Female") gen2Females.push(id);
    else gen2Males.push(id);
    cowId++;
  }

  const gen3Females: string[] = [];
  const gen3Males: string[] = [];
  const allMales2 = [...allMales, ...gen2Males];
  for (let i = 0; i < 50; i++) {
    const gender: "Female" | "Male" = i < 38 ? "Female" : "Male";
    const id = `c${cowId}`;
    const mother = pick([...gen1Females, ...gen2Females]);
    const sourceType: CowSource = randInt(0, 10) < 5 ? "Natural Birth" : "Sperm Donation";
    const father = sourceType === "Natural Birth" ? pick(allMales2) : null;
    const yearBorn = randInt(2023, 2025);
    const ageMonths = (2026 - yearBorn) * 12;
    const status: CowStatus = gender === "Male" ? (ageMonths < 18 ? "Calf" : "Bull") :
      (ageMonths < 24 ? "Calf" : (i < 15 ? "Milking" : (i < 25 ? "Pregnant" : "Dry")));
    configs.push({
      id, name: getName(gender), gender,
      dob: getDate(yearBorn),
      source: sourceType,
      motherId: mother,
      fatherId: father,
      generation: 3,
      status,
    });
    if (gender === "Female") gen3Females.push(id);
    else gen3Males.push(id);
    cowId++;
  }

  for (let i = 0; i < 43; i++) {
    const gender: "Female" | "Male" = i < 32 ? "Female" : "Male";
    const id = `c${cowId}`;
    const mother = pick([...gen2Females, ...gen3Females]);
    const sourceType: CowSource = randInt(0, 10) < 4 ? "Natural Birth" : (randInt(0, 10) < 6 ? "Sperm Donation" : "Donated");
    const allMales3 = [...allMales2, ...gen3Males];
    const father = sourceType === "Natural Birth" ? pick(allMales3) : null;
    configs.push({
      id, name: getName(gender), gender,
      dob: getDate(randInt(2025, 2026)),
      source: sourceType === "Donated" ? "Donated" : sourceType,
      motherId: sourceType === "Donated" ? null : mother,
      fatherId: father,
      generation: 4,
      status: "Calf",
    });
    cowId++;
  }

  return configs.map((cfg, idx) => {
    const ageYears = Math.max(0.5, (new Date("2026-02-25").getTime() - new Date(cfg.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    let weight: number;
    if (ageYears < 1) weight = randInt(40, 120);
    else if (ageYears < 2) weight = randInt(120, 220);
    else if (ageYears < 4) weight = randInt(220, 350);
    else weight = cfg.gender === "Male" ? randInt(400, 600) : randInt(300, 450);

    const isMilking = cfg.status === "Milking" || cfg.status === "Pregnant";
    const dailyMilk = isMilking ? randFloat(4, 15) : 0;
    const milkThreshold = 5;
    const weightThreshold = cfg.gender === "Male"
      ? (ageYears < 2 ? 100 : 350)
      : (ageYears < 2 ? 90 : 250);

    const quality = ageYears < 2 ? "young" : (rand() < 0.2 ? "excellent" : (rand() < 0.5 ? "good" : "average"));
    const breedScore = generateBreedScore(quality as any);

    const milkOutput = isMilking
      ? generateMilkHistory(dailyMilk, milkThreshold, Math.min(Math.floor(ageYears), 4))
      : [];
    const weightHistory = applyWeightThresholds(
      generateWeightHistory(weight, Math.floor(ageYears)),
      weightThreshold
    );

    const healthStatuses: Array<"Healthy" | "Under Treatment" | "Vaccinated"> = ["Healthy", "Healthy", "Healthy", "Vaccinated", "Vaccinated", "Under Treatment"];

    return {
      id: cfg.id,
      name: cfg.name,
      tagNumber: `SN-${String(idx + 1).padStart(3, "0")}`,
      breed: "Gir" as const,
      dateOfBirth: cfg.dob,
      gender: cfg.gender,
      weight,
      source: cfg.source,
      status: cfg.status,
      motherId: cfg.motherId,
      fatherId: cfg.fatherId,
      image: COW_IMAGES[idx % COW_IMAGES.length],
      milkOutput,
      weightHistory,
      healthStatus: pick(healthStatuses),
      lastVaccination: getDate(2025),
      nextVaccination: getDate(2026),
      dailyMilk,
      notes: generateNote(cfg),
      generation: cfg.generation,
      breedScore,
      totalBreedScore: totalScore(breedScore),
      milkThreshold,
      weightThreshold,
      gestationMonths: null,
      expectedDeliveryDate: null,
      lastCalvingDate: null,
      totalCalves: 0,
      lactationMonthsSinceCalving: null,
      dateOfPassing: null,
      causeOfDeath: null,
      yearsOfService: null,
      lifetimeMilkLiters: null,
      memorialNote: null,
    };
  });
}

function generateNote(cfg: CowGenConfig): string {
  const notes: Record<CowSource, string[]> = {
    "Natural Birth": ["Born naturally at the gaushala", "Healthy natural delivery", "Normal birth, thriving well"],
    "Donated": ["Donated by local devotee", "Gift from temple trust", "Donated by village panchayat", "Received from Somnath trust"],
    "Sperm Donation": ["Born via artificial insemination", "Artificially inseminated calf, good genetics", "Sperm donor: registered Gir bull"],
    "Purchased": ["Purchased from a breeder", "Bought from a reputable farm", "Acquired from a cattle auction"],
  };
  const statusNotes: Record<string, string[]> = {
    "Milking": [", excellent milk producer", ", consistent milker", ", steady output"],
    "Pregnant": [", currently expecting", ", due soon", ", pregnancy progressing well"],
    "Calf": [", growing well", ", healthy and active", ", playful young one"],
    "Bull": [", strong build", ", good temperament", ", breeding quality"],
    "Dry": [", currently dry period", ", resting phase", ""],
  };
  return pick(notes[cfg.source]) + (statusNotes[cfg.status] ? pick(statusNotes[cfg.status]) : "");
}

export const cows: Cow[] = (() => {
  const rawCows = generateCows();
  const rand2 = seededRandom(99);
  const randInt2 = (min: number, max: number) => Math.floor(rand2() * (max - min + 1)) + min;

  const causesOfDeath = [
    "Old age — passed peacefully",
    "Complications during calving",
    "Prolonged illness despite treatment",
    "Sudden cardiac arrest",
    "Age-related organ failure",
    "Snakebite — despite immediate treatment",
    "Respiratory illness",
    "Post-surgery complications",
  ];

  const memorialNotes = [
    "A beloved mother of the gaushala, she will be deeply missed. Her gentle nature touched everyone.",
    "One of our founding cows, she served the gaushala with grace and devotion for many years.",
    "Known for her calm temperament and loving nature. She was a favourite among the caretakers.",
    "A prolific milker who nourished countless calves. Her legacy lives on through her children.",
    "She was the heart of the herd. The gaushala feels emptier without her presence.",
    "A true Gir beauty with the best breed score in her generation. Her genes carry forward.",
    "Named after the goddess, she lived up to her name — gentle, nurturing, and divine.",
    "Her calves have grown into some of the strongest members of our herd today.",
  ];

  const deceasedIndices = [2, 5, 9, 13, 22, 35, 48];
  deceasedIndices.forEach((idx, i) => {
    if (idx < rawCows.length && rawCows[idx].gender === "Female") {
      const cow = rawCows[idx];
      const ageAtDeath = randInt2(8, 15);
      const birthYear = new Date(cow.dateOfBirth).getFullYear();
      const deathYear = Math.min(birthYear + ageAtDeath, 2025);
      const deathMonth = randInt2(1, 12);
      cow.status = "Deceased";
      cow.dateOfPassing = `${deathYear}-${String(deathMonth).padStart(2, "0")}-${String(randInt2(1, 28)).padStart(2, "0")}`;
      cow.causeOfDeath = causesOfDeath[i % causesOfDeath.length];
      cow.yearsOfService = deathYear - birthYear;
      cow.lifetimeMilkLiters = randInt2(1500, 4500);
      cow.totalCalves = randInt2(3, 8);
      cow.memorialNote = memorialNotes[i % memorialNotes.length];
      cow.dailyMilk = 0;
      cow.healthStatus = "Healthy";
    }
  });

  rawCows.forEach(cow => {
    if (cow.status === "Pregnant" && cow.gender === "Female") {
      const gestMonths = randInt2(2, 8);
      cow.gestationMonths = gestMonths;
      const now = new Date("2026-02-25");
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + (9 - gestMonths));
      cow.expectedDeliveryDate = dueDate.toISOString().split("T")[0];
      const prevCalvYear = randInt2(2023, 2025);
      cow.lastCalvingDate = `${prevCalvYear}-${String(randInt2(1, 12)).padStart(2, "0")}-${String(randInt2(1, 28)).padStart(2, "0")}`;
      cow.totalCalves = randInt2(1, 5);
    }
  });

  rawCows.forEach(cow => {
    if (cow.status === "Milking" && cow.gender === "Female") {
      const monthsSinceCalving = randInt2(1, 10);
      cow.lactationMonthsSinceCalving = monthsSinceCalving;
      const calvingDate = new Date("2026-02-25");
      calvingDate.setMonth(calvingDate.getMonth() - monthsSinceCalving);
      cow.lastCalvingDate = calvingDate.toISOString().split("T")[0];
      cow.totalCalves = randInt2(1, 6);

      if (cow.milkOutput.length > 0) {
        const peakMilk = cow.dailyMilk * 1.3;
        cow.milkOutput = cow.milkOutput.map((rec, i) => {
          const totalRecords = cow.milkOutput.length;
          const pos = i / Math.max(1, totalRecords - 1);
          let factor: number;
          if (pos < 0.15) factor = 0.6 + pos * 2.5;
          else if (pos < 0.35) factor = 1.0;
          else factor = 1.0 - (pos - 0.35) * 0.7;
          factor = Math.max(0.2, factor);
          const liters = +(peakMilk * factor + (rand2() - 0.5) * 2).toFixed(1);
          const val = Math.max(0.5, liters);
          return {
            ...rec,
            liters: val,
            belowThreshold: val < cow.milkThreshold,
          };
        });
      }
    }
  });

  rawCows.forEach(cow => {
    if (cow.status === "Dry" && cow.gender === "Female") {
      cow.lactationMonthsSinceCalving = null;
      const prevCalvYear = randInt2(2023, 2025);
      cow.lastCalvingDate = `${prevCalvYear}-${String(randInt2(1, 12)).padStart(2, "0")}-${String(randInt2(1, 28)).padStart(2, "0")}`;
      cow.totalCalves = randInt2(1, 4);
    }
  });

  return rawCows;
})();

export function getCowById(id: string): Cow | undefined {
  return cows.find(c => c.id === id);
}

export function getChildren(cowId: string): Cow[] {
  return cows.filter(c => c.motherId === cowId || c.fatherId === cowId);
}

export function getSiblings(cow: Cow): Cow[] {
  if (!cow.motherId) return [];
  return cows.filter(c => c.id !== cow.id && c.motherId === cow.motherId);
}

export function getAncestors(cowId: string, depth = 3): Cow[] {
  const ancestors: Cow[] = [];
  const cow = getCowById(cowId);
  if (!cow || depth === 0) return ancestors;
  if (cow.motherId) {
    const mother = getCowById(cow.motherId);
    if (mother) {
      ancestors.push(mother);
      ancestors.push(...getAncestors(mother.id, depth - 1));
    }
  }
  if (cow.fatherId) {
    const father = getCowById(cow.fatherId);
    if (father) {
      ancestors.push(father);
      ancestors.push(...getAncestors(father.id, depth - 1));
    }
  }
  return ancestors;
}

const activeCows = cows.filter(c => c.status !== "Deceased" && c.status !== "Donated Out");
const milkingCows = cows.filter(c => c.status === "Milking");
const pregnantCows = cows.filter(c => c.status === "Pregnant");
const calves = cows.filter(c => c.status === "Calf");
const bulls = cows.filter(c => c.status === "Bull");
const dryCows = cows.filter(c => c.status === "Dry");

export const kpiData = {
  totalCows: cows.length,
  activeCows: activeCows.length,
  milkingCows: milkingCows.length,
  pregnantCows: pregnantCows.length,
  calves: calves.length,
  bulls: bulls.length,
  dryCows: dryCows.length,
  totalMilkToday: +milkingCows.reduce((s, c) => s + c.dailyMilk, 0).toFixed(0),
  avgMilkPerCow: +(milkingCows.reduce((s, c) => s + c.dailyMilk, 0) / Math.max(1, milkingCows.length)).toFixed(1),
  avgBreedScore: +(cows.reduce((s, c) => s + c.totalBreedScore, 0) / cows.length).toFixed(1),
  femaleCount: cows.filter(c => c.gender === "Female").length,
  maleCount: cows.filter(c => c.gender === "Male").length,
  healthyCows: cows.filter(c => c.healthStatus === "Healthy").length,
  vaccinatedCows: cows.filter(c => c.healthStatus === "Vaccinated").length,
  underTreatment: cows.filter(c => c.healthStatus === "Under Treatment").length,
  monthlyMilk: MONTHS.slice(0, 6).map((m, i) => ({
    month: m,
    liters: +(milkingCows.length * (7 + Math.sin(i * 0.8) * 2) * 30).toFixed(0),
  })),
  sourceDistribution: [
    { source: "Natural Birth", count: cows.filter(c => c.source === "Natural Birth").length },
    { source: "Donated", count: cows.filter(c => c.source === "Donated").length },
    { source: "Sperm Donation", count: cows.filter(c => c.source === "Sperm Donation").length },
    { source: "Purchased", count: cows.filter(c => c.source === "Purchased").length },
  ],
  statusDistribution: [
    { status: "Milking", count: milkingCows.length },
    { status: "Pregnant", count: pregnantCows.length },
    { status: "Calves", count: calves.length },
    { status: "Bulls", count: bulls.length },
    { status: "Dry", count: dryCows.length },
  ],
  generationDistribution: [
    { gen: "Foundation (Gen 0)", count: cows.filter(c => c.generation === 0).length },
    { gen: "Gen 1", count: cows.filter(c => c.generation === 1).length },
    { gen: "Gen 2", count: cows.filter(c => c.generation === 2).length },
    { gen: "Gen 3", count: cows.filter(c => c.generation === 3).length },
    { gen: "Gen 4 (Calves)", count: cows.filter(c => c.generation === 4).length },
  ],
};

export const alerts: Alert[] = (() => {
  const types: Alert["type"][] = ["Vaccination", "Health Check", "Deworming", "Breeding", "Weight Check"];
  const priorities: Alert["priority"][] = ["High", "Medium", "Low"];
  const descriptions: Record<string, string[]> = {
    Vaccination: ["FMD Booster due", "HS-BQ vaccination", "Brucellosis shot", "Theileriosis vaccine"],
    "Health Check": ["Annual checkup", "Hoof inspection", "Dental check", "General wellness"],
    Deworming: ["Quarterly deworming", "Parasitic treatment", "Preventive dose"],
    Breeding: ["Heat cycle check", "Artificial Insemination Scheduling", "Pregnancy confirmation"],
    "Weight Check": ["Monthly weighing", "Growth monitoring", "Nutritional assessment"],
  };
  const result: Alert[] = [];
  const selectedCows = activeCows.slice(0, 30);
  selectedCows.forEach((cow, i) => {
    const type = types[i % types.length];
    const isOverdue = i < 6;
    result.push({
      id: `a${i + 1}`,
      cowId: cow.id,
      cowName: cow.name,
      type,
      dueDate: isOverdue ? `2026-01-${String(randInt(1, 28)).padStart(2, "0")}` : `2026-${String(randInt(3, 8)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
      status: isOverdue ? "Overdue" : "Pending",
      description: pick(descriptions[type]),
      priority: isOverdue ? "High" : pick(priorities),
    });
  });
  return result;
})();

export const timelineData: TimelineEvent[] = (() => {
  const years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const MONTHS_ARR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const outgoingNames = [
    "Poonam", "Sunita", "Bela", "Renu", "Sharda", "Kaushalya", "Vimla",
  ];
  const deceasedNames = [
    "Manorama", "Saroj", "Kusum", "Shobhana", "Nirja",
  ];
  const purchasedNames = [
    "Ratna", "Hemlata", "Sumitra", "Gita", "Bhawani", "Kalindi",
  ];
  let outIdx = 0;
  let decIdx = 0;
  let purIdx = 0;

  return years.map(year => {
    const bornThisYear = cows.filter(c => new Date(c.dateOfBirth).getFullYear() === year);
    const events: TimelineEvent["events"] = [];

    bornThisYear.forEach(c => {
      const m = new Date(c.dateOfBirth).getMonth();
      const type = c.source === "Donated" ? "donated_in" as const
        : c.source === "Sperm Donation" ? "sperm_donation" as const
          : c.source === "Purchased" ? "purchased" as const
            : "birth" as const;
      events.push({
        type,
        cowName: c.name,
        date: `${MONTHS_ARR[m]} ${year}`,
        month: m,
      });
    });

    if (year >= 2018 && year <= 2024 && year % 2 === 0) {
      const pName = purchasedNames[purIdx % purchasedNames.length];
      purIdx++;
      events.push({ type: "purchased", cowName: pName, date: `${MONTHS_ARR[randInt(0, 11)]} ${year}`, month: randInt(0, 11) });
    }

    let outgoing = 0;
    if (year === 2024) {
      const name = outgoingNames[outIdx % outgoingNames.length]; outIdx++;
      events.push({ type: "donated_out", cowName: name, date: `${MONTHS_ARR[3]} ${year}`, month: 3 });
      outgoing++;
    }
    if (year === 2025) {
      for (let k = 0; k < 2; k++) {
        const name = outgoingNames[outIdx % outgoingNames.length]; outIdx++;
        events.push({ type: "donated_out", cowName: name, date: `${MONTHS_ARR[k + 1]} ${year}`, month: k + 1 });
        outgoing++;
      }
    }
    if (year === 2022) {
      const name = outgoingNames[outIdx % outgoingNames.length]; outIdx++;
      events.push({ type: "donated_out", cowName: name, date: `${MONTHS_ARR[7]} ${year}`, month: 7 });
      outgoing++;
    }

    if (year === 2023) {
      const name = deceasedNames[decIdx % deceasedNames.length]; decIdx++;
      events.push({ type: "deceased", cowName: name, date: `${MONTHS_ARR[9]} ${year}`, month: 9 });
      outgoing++;
    }
    if (year === 2021) {
      const name = deceasedNames[decIdx % deceasedNames.length]; decIdx++;
      events.push({ type: "deceased", cowName: name, date: `${MONTHS_ARR[5]} ${year}`, month: 5 });
      outgoing++;
    }
    if (year === 2025) {
      const name = deceasedNames[decIdx % deceasedNames.length]; decIdx++;
      events.push({ type: "deceased", cowName: name, date: `${MONTHS_ARR[0]} ${year}`, month: 0 });
      outgoing++;
    }

    const incoming = bornThisYear.length + (year >= 2018 && year <= 2024 && year % 2 === 0 ? 1 : 0);
    return {
      year,
      incoming,
      outgoing,
      net: incoming - outgoing,
      events,
    };
  }).filter(y => y.events.length > 0);
})();

export const GIR_BREED_STANDARDS = {
  headShape: { ideal: 9, description: "Broad, prominent forehead with a convex profile. The head should be majestic and well-proportioned." },
  hornCurvature: { ideal: 9, description: "Lyre-shaped horns curving upward and backward. Unique to Gir, they should be thick at the base." },
  earShape: { ideal: 9, description: "Long (20-25cm), pendulous, leaf-shaped ears that fold like a curled leaf. Highly distinctive." },
  humpSize: { ideal: 8, description: "Well-developed thoracic hump, especially prominent in bulls. Should be firm and centered." },
  dewlap: { ideal: 8, description: "Large, pendulous dewlap extending from lower jaw to brisket. Indicates good tropical adaptation." },
  bodyFrame: { ideal: 9, description: "Compact, well-muscled body with deep barrel chest. Strong legs with hard hooves." },
  udderShape: { ideal: 9, description: "Well-attached, bowl-shaped udder with evenly-spaced teats. Good milk vein development." },
  coatColor: { ideal: 8, description: "Red to spotted (red & white patches). The coat should be lustrous and smooth, with a distinctive Gir pattern." },
  tailLength: { ideal: 8, description: "Long tail reaching below the hocks with a black switch. Clean tail setting." },
  overallConformation: { ideal: 9, description: "Harmonious body proportions, alert temperament, graceful movement, typical Gir characteristics." },
};

export const heroImage = "https://images.unsplash.com/photo-1735192683815-d8918aad53dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTb21uYXRoJTIwdGVtcGxlJTIwR3VqYXJhdCUyMEluZGlhfGVufDF8fHx8MTc3MjAwNTYxNHww&ixlib=rb-4.1.0&q=80&w=1080";
export const herdImage = "https://images.unsplash.com/photo-1760796812170-00eb8c0b8552?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWlyeSUyMGNvdyUyMGhlcmQlMjBncmF6aW5nfGVufDF8fHx8MTc3MjAwMDM2MHww&ixlib=rb-4.1.0&q=80&w=1080";

export const donationRecords: DonationRecord[] = (() => {
  const dRand = seededRandom(777);
  const dRandInt = (min: number, max: number) => Math.floor(dRand() * (max - min + 1)) + min;
  const dPick = <T,>(arr: T[]): T => arr[dRandInt(0, arr.length - 1)];

  const donorNames = [
    "Shri Rameshbhai Patel", "Smt. Kamlaben Shah", "Shri Harishchandra Mehta",
    "Smt. Jyotiben Desai", "Shri Pravinbhai Solanki", "Dr. Anil Kumar Trivedi",
    "Shri Mansukhbhai Gajera", "Smt. Urmilaben Joshi", "Shri Natubhai Shah",
    "Shri Rajubhai Chauhan", "Smt. Shardaben Bhatt", "Shri Jayeshbhai Thakor",
    "Pandit Govindram Sharma", "Smt. Induben Kothari", "Shri Bhagwandas Agrawal",
  ];

  const organizations = [
    "Ambaji Temple Trust", "Junagadh Gau Seva Mandal", "Veraval Pashupalan Sangh",
    "Gujarat Gir Cow Foundation", "Saurashtra Gaushala Samiti", "Diu Gau Raksha Trust",
    "Bhavnagar Cattle Welfare Board", "Amreli Panchayat Gaushala", "Dabhoi Panjra Pol",
    "Porbandar Goseva Parishad", "Gir Forest Cattle Association", "Dwarka Mandir Trust",
    "Ahmedabad Gau Sewa Kendra", "Patan Heritage Gaushala", "Jamnagar Livestock Trust",
  ];

  const districts = [
    "Gir Somnath", "Junagadh", "Veraval", "Amreli", "Bhavnagar",
    "Rajkot", "Porbandar", "Diu", "Jamnagar", "Dwarka",
    "Ahmedabad", "Patan", "Surendranagar", "Morbi", "Kutch",
  ];

  const pocNames = [
    "Vinodbhai Makwana", "Ashokbhai Rana", "Jitendrabhai Vyas",
    "Nitinbhai Pandya", "Ketanbhai Dodia", "Maheshbhai Sorathiya",
    "Sanjaybhai Rathod", "Bharatbhai Gadhvi", "Girishbhai Tanna",
    "Prakashbhai Jadeja", "Nareshbhai Vaghela", "Dipakbhai Gohil",
  ];

  const healthStatuses = [
    "Healthy, all vaccinations current",
    "Healthy, recently dewormed",
    "Good health, FMD vaccinated",
    "Excellent condition, breed certified",
    "Healthy, slight underweight but improving",
    "Good health, recently treated for minor hoof issue",
  ];

  const donatedInRemarks = [
    "Donated as part of Navratri seva. Devotee wanted the cow to be cared for at a temple gaushala.",
    "Trust donation — part of their annual Gau Daan program.",
    "Family donated the cow in memory of late Shri Rameshbhai. Requested regular updates.",
    "Rescued cow from roadside, brought to gaushala by local panchayat.",
    "Donated by farmer who could no longer maintain the herd. Requested good care.",
    "Temple trust transferred cow as part of inter-gaushala exchange program.",
    "Generous donation from a devotee visiting the Somnath temple.",
    "Donated from a closing gaushala in the region. All paperwork provided.",
    "Gift during Makar Sankranti celebration. Donor visits quarterly.",
    "Panchayat donation — cow was found abandoned. Now thriving at our gaushala.",
  ];

  const donatedOutRemarks = [
    "Donated to a newly established gaushala in the neighbouring district as part of our outreach.",
    "Given to a farmer family in need. They promised good care and send regular updates.",
    "Transferred to a temple trust that was starting their own Gir breeding program.",
    "Donated to a rural school gaushala as part of our education initiative.",
    "Transferred to an organic dairy co-operative for breed preservation.",
    "Given to a village panchayat gaushala for their cow protection program.",
  ];

  const currentUpdates = [
    "Cow is healthy and thriving. Has given birth to 2 calves since transfer. Recipient sends photos quarterly.",
    "Doing well at the new gaushala. Milking 8L/day. Healthy and active.",
    "Settled in beautifully. Has become the favourite among caretakers. Regular vet checkups maintained.",
    "Excellent care provided. Cow recently vaccinated. Weight has improved since transfer.",
    "Healthy and well-cared for. The recipient reports she has adapted well to the new environment.",
    "All good. Recent photos show the cow in great condition. They maintain breed standards.",
    null,
  ];

  const generatePhone = () => {
    const prefix = dPick(["98250", "94260", "99780", "97260", "98790", "97120", "98980", "94080"]);
    return `+91 ${prefix}${String(dRandInt(10000, 99999))}`;
  };

  const records: DonationRecord[] = [];

  const donatedInCows = cows.filter(c => c.source === "Donated");
  donatedInCows.forEach((cow, i) => {
    records.push({
      id: `don-in-${i + 1}`,
      cowId: cow.id,
      cowName: cow.name,
      cowImage: cow.image,
      cowGender: cow.gender,
      cowTagNumber: cow.tagNumber,
      type: "Donated In",
      date: cow.dateOfBirth,
      contact: {
        name: donorNames[i % donorNames.length],
        organization: organizations[i % organizations.length],
        district: districts[i % districts.length],
        phone: generatePhone(),
        pocName: pocNames[i % pocNames.length],
        pocPhone: generatePhone(),
      },
      ageAtDonation: cow.generation === 0
        ? `${dRandInt(2, 6)} years`
        : cow.generation === 4
          ? `${dRandInt(2, 8)} months`
          : `${dRandInt(1, 4)} years`,
      weightAtDonation: cow.generation === 4 ? dRandInt(40, 120) : dRandInt(200, 400),
      healthAtDonation: dPick(healthStatuses),
      breedCertified: dRand() > 0.3,
      remarks: dPick(donatedInRemarks),
      currentUpdate: null,
      lastUpdateDate: null,
    });
  });

  const outgoingCowNames = [
    { name: "Poonam", gender: "Female" as const, year: 2024, month: 3 },
    { name: "Sunita", gender: "Female" as const, year: 2025, month: 1 },
    { name: "Bela", gender: "Female" as const, year: 2025, month: 2 },
    { name: "Renu", gender: "Female" as const, year: 2022, month: 7 },
    { name: "Sharda", gender: "Female" as const, year: 2023, month: 5 },
    { name: "Kaushalya", gender: "Female" as const, year: 2021, month: 9 },
    { name: "Vimla", gender: "Female" as const, year: 2024, month: 10 },
    { name: "Magan", gender: "Male" as const, year: 2023, month: 2 },
    { name: "Ratan", gender: "Male" as const, year: 2025, month: 1 },
  ];

  outgoingCowNames.forEach((entry, i) => {
    const dateStr = `${entry.year}-${String(entry.month + 1).padStart(2, "0")}-${String(dRandInt(1, 28)).padStart(2, "0")}`;
    const updateDate = `${Math.min(entry.year + 1, 2026)}-${String(dRandInt(1, 12)).padStart(2, "0")}-${String(dRandInt(1, 28)).padStart(2, "0")}`;
    records.push({
      id: `don-out-${i + 1}`,
      cowId: null,
      cowName: entry.name,
      cowImage: COW_IMAGES[(i + 3) % COW_IMAGES.length],
      cowGender: entry.gender,
      cowTagNumber: `SN-OUT-${String(i + 1).padStart(2, "0")}`,
      type: "Donated Out",
      date: dateStr,
      contact: {
        name: donorNames[(i + 7) % donorNames.length],
        organization: organizations[(i + 5) % organizations.length],
        district: districts[(i + 3) % districts.length],
        phone: generatePhone(),
        pocName: pocNames[(i + 4) % pocNames.length],
        pocPhone: generatePhone(),
      },
      ageAtDonation: entry.gender === "Male" ? `${dRandInt(2, 5)} years` : `${dRandInt(3, 8)} years`,
      weightAtDonation: entry.gender === "Male" ? dRandInt(350, 550) : dRandInt(250, 400),
      healthAtDonation: dPick(healthStatuses),
      breedCertified: dRand() > 0.25,
      remarks: dPick(donatedOutRemarks),
      currentUpdate: dPick(currentUpdates),
      lastUpdateDate: updateDate,
    });
  });

  return records;
})();