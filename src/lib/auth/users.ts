import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { userRowToStored, type UserRow } from "@/lib/supabase/rows";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();

  if (error) {
    console.error("findUserByEmail:", error.message);
    return null;
  }
  if (!data) return null;
  return userRowToStored(data as UserRow);
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("findUserById:", error.message);
    return null;
  }
  if (!data) return null;
  return userRowToStored(data as UserRow);
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<StoredUser> {
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

  const { error } = await getSupabaseAdmin().from("users").insert({
    id: user.id,
    email: user.email,
    name: user.name,
    password_hash: user.passwordHash,
    created_at: user.createdAt,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("An account with this email already exists.");
    }
    throw new Error(error.message);
  }

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
