import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json({
      message: "Login successfully",
      success: true,
      status: 200,
    });

    response.cookies.set("token", "",  {httpOnly: true, expires: new Date(0)});
    return response;

  } catch (error: any) {
    console.log("error occurred during logout", error);
    return NextResponse.json({
      error: "Error occured",
      success: false,
      status: 400
    })
  }
}