import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logged out successfully.",
      success: true,
    }, { status: 200 }) 


    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),                         
    })

    return response;

  } catch (err) {

    console.error("[logout] Error occurred during logout:", err);

    return NextResponse.json(
      { error: "An error occurred during logout.", success: false },
      { status: 500 }
    )
  }
}