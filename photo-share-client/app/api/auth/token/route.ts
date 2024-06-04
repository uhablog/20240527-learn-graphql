import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    message: 'Success'
  }, {
    status: 201,
    headers: {
      "Set-Cookie": `token=${encodeURIComponent(body.token)}; HttpOnly; Secure; SameSite=Lax; Path=/;`
    }
  });
}