import { getOrbitalData } from "@/lib/data/celestrak";
import HomeClient from "./HomeClient";

export const revalidate = 7200; // 2 hours ISR

export default async function Home() {
  let counts = null;

  try {
    const data = await getOrbitalData();
    counts = data.counts;
  } catch (error) {
    console.error("Failed to load orbital data on page render:", error);
  }

  return <HomeClient initialCounts={counts} />;
}
