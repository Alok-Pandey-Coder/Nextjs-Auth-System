import { getDataFromToken } from "@/helpers/getDataFromToke";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/db/dbconfig";


export async function GET(request: NextRequest) {

  try {
    await connect();
  } catch (error) {
    console.error("[ME] DB connection failed")

    return NextResponse.json(
      {error: "Database connection error"},
      {status: 500},
    )
  }

  try {
    const userID =  getDataFromToken(request)
    const user = await User.findOne({_id: userID}).select("-password -isAdmin");

    return NextResponse.json({
      message: "User found",
      data: user
    })
  } catch (error: any) {
    
    return NextResponse.json({error: error.message}, {status: 400});
  }
}