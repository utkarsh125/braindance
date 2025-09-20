import { RoomState } from "@repo/shared-types/index";

const rooms = new Map<string, RoomState>();

export function createRoom(roomId: string): RoomState {
    const roomState: RoomState = {
        id: roomId,
        users: new Map(),
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      rooms.set(roomId, roomState);
      return roomState;
}

export const joinRoom(roomId: string, user: User): boolean {
    let room = rooms.get(roomId);

    if(!room){
        room = createRoom(roomId);
    }

    room.users.get(user.userId, user);
    user.currentRoom =

}