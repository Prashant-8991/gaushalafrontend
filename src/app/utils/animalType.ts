export const ADULT_AGE_YEARS = 3.5;

export function ageInYears(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) return null;
  const raw = String(dateOfBirth).trim();
  if (!raw || raw === "-" || raw.toLowerCase() === "not available") return null;
  const dob = new Date(raw.includes(" ") ? raw.replace(" ", "T") : raw);
  if (isNaN(dob.getTime())) return null;
  return (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

export function deriveAnimalTypeByDob(
  animalType?: string | null,
  gender?: string | null,
  dateOfBirth?: string | null,
): string {
  const current = (animalType || "").trim();
  if (current.toUpperCase() === "OX") return "OX";

  const age = ageInYears(dateOfBirth);
  if (age === null) return current || "—";

  const isAdult = age >= ADULT_AGE_YEARS;
  const g = (gender || "").trim().toLowerCase();
  if (g === "female") return isAdult ? "COW" : "FEMALE CALF";
  if (g === "male") return isAdult ? "BULL" : "MALE CALF";
  return current || "—";
}
