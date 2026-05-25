import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}

const USERS_DIR = path.join(process.cwd(), ".data", "users");

function userPath(id: string) {
  return path.join(USERS_DIR, `${id}.json`);
}

function emailIndexPath(email: string) {
  return path.join(USERS_DIR, "by-email", `${email.toLowerCase()}.json`);
}

async function ensureDirs() {
  await mkdir(path.join(USERS_DIR, "by-email"), { recursive: true });
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | null> {
  try {
    const raw = await readFile(emailIndexPath(email), "utf8");
    const { id } = JSON.parse(raw) as { id: string };
    const userRaw = await readFile(userPath(id), "utf8");
    return JSON.parse(userRaw) as StoredUser;
  } catch {
    return null;
  }
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  try {
    const raw = await readFile(userPath(id), "utf8");
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<StoredUser> {
  await ensureDirs();
  const normalized = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(normalized);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: normalized,
    name: input.name.trim() || normalized.split("@")[0],
    passwordHash: await hashPassword(input.password),
    createdAt: Date.now(),
  };

  await writeFile(userPath(user.id), JSON.stringify(user, null, 2), "utf8");
  await writeFile(
    emailIndexPath(normalized),
    JSON.stringify({ id: user.id }),
    "utf8"
  );
  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export function toAuthUser(user: StoredUser) {
  return { id: user.id, email: user.email, name: user.name };
}
