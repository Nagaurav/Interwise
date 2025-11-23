import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json(
    { error: "Recording uploads are no longer supported." },
    { status: 410 }
  );
}
