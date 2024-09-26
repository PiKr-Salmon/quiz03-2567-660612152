import jwt from "jsonwebtoken";
import { Database, DB, readDB, User } from "@lib/DB";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { username, password } = body;

  readDB();
  const user = (<Database>DB).users.find(
    (user) => user.username === username && user.password === password);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Username or password is incorrect",
      },
      { status: 400 }
    );
  }

  const secret = process.env.JWT_SECRET || "This is another secret"

  //if found user, sign a JWT TOKEN
  const token = jwt.sign(
    { username, role: user.role},
    secret,
    { expiresIn: "8h" }
  );

  return NextResponse.json({ ok: true, token});
};
