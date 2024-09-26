import { DB, readDB, writeDB , Database ,Payload} from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  readDB();
  return NextResponse.json({
    ok: true,
    rooms: (<Database>DB).rooms,
    totalRooms: (<Database>DB).rooms.length
  });
};

export const POST = async (request: NextRequest) => {
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

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        ok: true,
        message: "Only Admin can access this API route",
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { roomName } = body;

  readDB();
  //find if room exist 
  const foundroom = (<Database>DB).rooms.find((x) => x.roomName === roomName)
  if(foundroom){
  return NextResponse.json(
    {
      ok: false,
      message: `Room ${roomName} already exists`,
    },
    { status: 400 }
  );
  }

  const roomId = nanoid();
  (<Database>DB).rooms.push({
    roomId,
    roomName,
  });

  //call writeDB after modifying Database
  writeDB();

  return NextResponse.json({
    ok: true,
    roomId,
    message: `Room ${roomName} has been created`,
  });
};
