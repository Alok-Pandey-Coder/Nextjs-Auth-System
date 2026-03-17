import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/db/dbconfig";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("It Must be a valid email").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

type loginInput = z.infer<typeof loginSchema>;

function sanitizeUser(user: { _id: unknown; username: string; email: string }) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
  };
}

const GENERIC_AUTH_ERROR = "Invalid email or password.";

export async function POST(request: NextRequest) {
  try {
    await connect();
  } catch (err) {
    console.error("[login] DB connection failed:", err);
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const { email, password }: loginInput = parsed.data;

  const TOKEN_SECRET = process.env.TOKEN_SECRET;
  if (!TOKEN_SECRET) {
    console.error("[login] TOKEN_SECRET environment variable is not set.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 },
    );
  }

  try {
    const user = await User.findOne({ email }).select(
      "password username email _id",
    );

    // this entire block is missing from your file — add it back
    if (!user) {
      await bcrypt.compare(
        password,
        "$2b$12$dummyhashfortimingprotectiononly000000000000000000000",
      );
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const tokenData = {
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(tokenData, TOKEN_SECRET, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    const response = NextResponse.json(
      {
        message: "Login successful.",
        success: true,
        user: sanitizeUser(user),
      },
      { status: 200 },
    );
    response.cookies.set("token", token, {
      httpOnly: true,
    });

    return response;
  } catch (err) {
    console.error("[login] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
