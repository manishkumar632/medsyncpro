import { NextResponse } from "next/server";

export async function response(res: Response) {
  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}