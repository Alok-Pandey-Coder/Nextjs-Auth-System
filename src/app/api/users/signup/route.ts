import {connect} from "@/db/dbconfig"
import { NextResponse, NextRequest } from "next/server"
import User from "@/models/userModel";
import bcrypt from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const {username, email, password} = reqBody;

    const user = await User.findOne({email})
    if(user) {
      return NextResponse.json({
        error: "User already registerd",
        status: 400
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    })

    const savedUser = await newUser.save()

    console.log(savedUser)

    return NextResponse.json({
      message: "Created user Successfully",
      success: true,
      savedUser
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      status: 500,
    })
  }
}