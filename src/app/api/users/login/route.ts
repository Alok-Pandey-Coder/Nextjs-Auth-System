import {connect} from "@/db/dbconfig"
import { NextResponse, NextRequest } from "next/server"
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import toast from "react-hot-toast";
import jwt from "jsonwebtoken"

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const {email, password} = reqBody

    const user = await User.findOne({email});

    if(!user) {
      return NextResponse.json({
        error: "User not found",
        status: 404,
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if(!validPassword) {
      return NextResponse.json({
        error: "Password is invalid",
        status: 400
      })
    }

    const tokenData = {
      _id: user._id,
      username: user.username,
      email: email.username,
    }

    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: "1d"})

    const response = NextResponse.json({
      message: "Login successfull",
      status: 200,
      success: true,
    })

    response.cookies.set("token", token, {httpOnly: true})

    return response;
  } catch (error: any) {
    console.log("Login failed", error.message);
    
  }
}