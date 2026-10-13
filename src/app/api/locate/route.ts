import { NextResponse } from "next/server";

// Anchor default to The Red Löffel base: Nalanda living boys hostel , near NIET BUISNESS SCHOOL, knowledge park 3
export async function GET() {
  return NextResponse.json({
    success: true,
    lat: 28.4744,
    lng: 77.4917,
    locality: "Knowledge Park 3",
    city: "Greater Noida",
    address: "Nalanda living boys hostel , near NIET BUISNESS SCHOOL, knowledge park 3",
    zip: "201310",
  });
}
