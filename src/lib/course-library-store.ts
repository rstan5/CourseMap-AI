import { mkdir, readFile, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import type { CourseMapPayload } from "@/types/course";
import type { CourseMapSummary, StoredCourseMap } from "@/types/course-library";

const DATA_DIR = path.join(process.cwd(), ".data", "course-maps");

function userDir(userId: string) {
  return path.join(DATA_DIR, userId);
}

function mapPath(userId: string, id: string) {
  return path.join(userDir(userId), `${id}.json`);
}

async function ensureUserDir(userId: string) {
  await mkdir(userDir(userId), { recursive: true });
}

function toSummary(record: StoredCourseMap): CourseMapSummary {
  return {
    id: record.id,
    title: record.course_map_overview.title,
    subject: record.course_map_overview.inferred_subject,
    updatedAt: record.updatedAt,
    moduleCount: record.concept_map.length,
  };
}

function toClientData(record: StoredCourseMap): import("@/types/course").CourseMapData {
  return {
    id: record.id,
    course_map_overview: record.course_map_overview,
    concept_map: record.concept_map,
    learning_sequence: record.learning_sequence,
    high_level_dependencies: record.high_level_dependencies,
    missing_or_unclear_areas: record.missing_or_unclear_areas,
  };
}

async function readRecord(
  userId: string,
  id: string
): Promise<StoredCourseMap | null> {
  try {
    const raw = await readFile(mapPath(userId, id), "utf8");
    return JSON.parse(raw) as StoredCourseMap;
  } catch {
    return null;
  }
}

export async function listCourseMapsForUser(
  userId: string
): Promise<CourseMapSummary[]> {
  const dir = userDir(userId);
  try {
    const files = await readdir(dir);
    const summaries: CourseMapSummary[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await readFile(path.join(dir, file), "utf8");
      const record = JSON.parse(raw) as StoredCourseMap;
      summaries.push(toSummary(record));
    }
    return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function getCourseMapForUser(
  userId: string,
  id: string
): Promise<StoredCourseMap | null> {
  const record = await readRecord(userId, id);
  if (!record || record.userId !== userId) return null;
  return record;
}

export async function getCourseMapById(id: string): Promise<StoredCourseMap | null> {
  try {
    const users = await readdir(DATA_DIR);
    for (const userId of users) {
      const record = await readRecord(userId, id);
      if (record) return record;
    }
  } catch {
    return null;
  }
  return null;
}

export async function createCourseMapForUser(
  userId: string,
  payload: CourseMapPayload,
  sourceText: string
): Promise<StoredCourseMap> {
  await ensureUserDir(userId);
  const now = Date.now();
  const id = crypto.randomUUID();
  const record: StoredCourseMap = {
    ...payload,
    id,
    userId,
    sourceText,
    createdAt: now,
    updatedAt: now,
  };
  await writeFile(mapPath(userId, id), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function updateCourseMapForUser(
  userId: string,
  id: string,
  payload: CourseMapPayload,
  additionalSourceText: string
): Promise<StoredCourseMap | null> {
  const existing = await readRecord(userId, id);
  if (!existing || existing.userId !== userId) return null;

  const now = Date.now();
  const record: StoredCourseMap = {
    ...payload,
    id,
    userId,
    sourceText: [existing.sourceText, additionalSourceText]
      .filter(Boolean)
      .join("\n\n---\n\n"),
    createdAt: existing.createdAt,
    updatedAt: now,
  };
  await writeFile(mapPath(userId, id), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export function storedToClientData(record: StoredCourseMap) {
  return toClientData(record);
}

export async function migrateLibraryOwner(
  fromOwnerId: string,
  toOwnerId: string
): Promise<void> {
  if (fromOwnerId === toOwnerId) return;

  const from = userDir(fromOwnerId);
  await ensureUserDir(toOwnerId);

  let files: string[];
  try {
    files = await readdir(from);
  } catch {
    return;
  }

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const raw = await readFile(path.join(from, file), "utf8");
    const record = JSON.parse(raw) as StoredCourseMap;
    record.userId = toOwnerId;
    await writeFile(
      mapPath(toOwnerId, record.id),
      JSON.stringify(record, null, 2),
      "utf8"
    );
    await unlink(path.join(from, file));
  }
}
