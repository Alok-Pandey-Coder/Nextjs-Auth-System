import { NextRequest } from "next/server";
import jwt from "jsonwebtoken"

export const getDataFromToken = (request: NextRequest): string => {

  const TOKEN_SECRET = process.env.TOKEN_SECRET;
  if (!TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET environment variable is not set.");
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    throw new Error("No token found in cookies.");
  }



  const decodedToken = jwt.verify(token, TOKEN_SECRET) as jwt.JwtPayload;


  const userId = decodedToken.sub;
  if (!userId) {
    throw new Error("Token payload is missing user id.");
  }

  return userId;

}