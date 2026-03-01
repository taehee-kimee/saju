export interface RemoteCommand {
  type: 'next-section' | 'prev-section' | 'goto-section' | 'scroll-up' | 'scroll-down';
  sectionIndex?: number;
  timestamp: number;
}

interface Room {
  id: string;
  createdAt: number;
  commands: RemoteCommand[];
}

const rooms = new Map<string, Room>();

const ROOM_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_COMMANDS = 100;

function cleanup() {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.createdAt > ROOM_TTL_MS) {
      rooms.delete(id);
    }
  }
}

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(): string {
  cleanup();
  let id = generateRoomId();
  while (rooms.has(id)) {
    id = generateRoomId();
  }
  rooms.set(id, { id, createdAt: Date.now(), commands: [] });
  return id;
}

export function roomExists(roomId: string): boolean {
  return rooms.has(roomId);
}

export function addCommand(roomId: string, command: Omit<RemoteCommand, 'timestamp'>): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;
  room.commands.push({ ...command, timestamp: Date.now() });
  if (room.commands.length > MAX_COMMANDS) {
    room.commands = room.commands.slice(-MAX_COMMANDS);
  }
  return true;
}

export function getCommands(roomId: string, since: number): RemoteCommand[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  return room.commands.filter((cmd) => cmd.timestamp > since);
}
