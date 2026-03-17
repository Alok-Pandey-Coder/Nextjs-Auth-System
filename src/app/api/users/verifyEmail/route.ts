import { connect } from "@/db/dbconfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { z } from "zod"

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
})

type verifyEmailType = z.infer<typeof verifyEmailSchema>

export async function POST(request: NextRequest) {

  try {
    await connect();
  } catch (err) {

    console.error("[verifyEmail] DB connection failed:", err)
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 503 }
    )
  }

  let body: unknown;
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 } 
    )
  }


  const parsed = verifyEmailSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { token }: verifyEmailType = parsed.data 

  try {
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token." }, { status: 401 })
    }

    user.isVerified = true;
    user.verifyToken = undefined;    
    user.verifyTokenExpiry = undefined;

    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully.", success: true },
      { status: 200 }
    )

  } catch (err) {
    console.error("[verifyEmail] Unexpected error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}