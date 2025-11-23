import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json(
    { message: "Recording listings are no longer available." },
    { status: 410 }
  );
}
