import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/db/dbconfig";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";
import { z } from "zod";


const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"), // bcrypt silently truncates at 72 bytes
});


type RegisterInput = z.infer<typeof RegisterSchema>;

function sanitizeUser(user: { _id: unknown; username: string; email: string }) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
  };
}


export async function POST(request: NextRequest) {

  try {
    await connect();
  } catch (err) {
    console.error("[register] DB connection failed:", err);
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

 
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { username, email, password }: RegisterInput = parsed.data;

  try {

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).lean(); 

    if (existingUser) {

      return NextResponse.json(
        { error: "An account with these credentials already exists." },
        { status: 409 } 
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });


    try {
      await sendEmail({
        email,
        emailType: "VERIFY",
        userId: newUser._id,
      });
    } catch (emailErr) {

      console.error("[register] Failed to send verification email:", emailErr);
    }

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        success: true,
        user: sanitizeUser(newUser),
      },
      { status: 201 }
    );
  } catch (err) {

    console.error("[register] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}