import { DB, readDB, writeDB ,Database ,Payload } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const RoomId = request.nextUrl.searchParams.get("roomId");

  readDB();
  let findRoom = (<Database>DB).messages.find((x) => x.roomId === RoomId)
    if(!findRoom){
      return NextResponse.json(
        {
          ok: false,
          message: `Room is not found`,
        },
        { status: 404 }
      );
  }

  let filter = (<Database>DB).messages;
  if (RoomId !== null) {
    filter = filter.filter((std) => std.roomId === RoomId);
  }
    return NextResponse.json(
      {
        ok: true,
        filter,
      },
      { status: 200 }
    );
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { roomId, messageText } = body;
  
  readDB();
  let findRoom = (<Database>DB).messages.find((x) => x.roomId === roomId)
    if(!findRoom){
      return NextResponse.json(
        {
          ok: false,
          message: `Room is not found`,
        },
        { status: 404 }
      );
  }

  const messageId = nanoid();

  (<Database>DB).messages.push({
    roomId,
    messageId,
    messageText,
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  const payload = checkToken();

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  const { role } = <Payload>payload;

  if (role !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        ok: true,
        message: "Only SUPER Admin can access this API route",
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { messageId } = body;

  readDB();
  const foundMessage = (<Database>DB).messages.findIndex(
    (x) => x.messageId === messageId
  );
  if (foundMessage === -1) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Message is not found",
      },
      { status: 404 }
    );
  }

  (<Database>DB).messages.splice(foundMessage, 1);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
