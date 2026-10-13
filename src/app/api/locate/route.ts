import { NextResponse } from "next/server";

// Anchor default to The Red Löffel base: Raghuma Boys Hostel Block C, Knowledge Park III, Greater Noida
export async function GET() {
  return NextResponse.json({
    success: true,
    lat: 28.4744,
    lng: 77.4917,
    locality: "Knowledge Park III",
    city: "Greater Noida",
    address: "Raghuma Boys Hostel Block C, Knowledge Park III, Greater Noida",
    zip: "201310",
  });
}
