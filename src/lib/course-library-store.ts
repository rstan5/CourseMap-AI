import { normalizeCourseMap } from "@/lib/normalize-course-map";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  courseMapRowToStored,
  storedToCourseMapRow,
  type CourseMapRow,
} from "@/lib/supabase/rows";
import type { CourseMapPayload } from "@/types/course";
import type { CourseMapSummary, StoredCourseMap } from "@/types/course-library";

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
  const normalized = normalizeCourseMap(record as unknown as CourseMapPayload);
  return { id: record.id, ...normalized };
}

export async function listCourseMapsForUser(
  userId: string
): Promise<CourseMapSummary[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("course_maps")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listCourseMapsForUser:", error.message);
    return [];
  }

  return (data as CourseMapRow[]).map((row) =>
    toSummary(courseMapRowToStored(row))
  );
}

export async function getCourseMapForUser(
  userId: string,
  id: string
): Promise<StoredCourseMap | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("course_maps")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getCourseMapForUser:", error.message);
    return null;
  }
  if (!data) return null;
  return courseMapRowToStored(data as CourseMapRow);
}

export async function getCourseMapById(
  id: string
): Promise<StoredCourseMap | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("course_maps")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getCourseMapById:", error.message);
    return null;
  }
  if (!data) return null;
  return courseMapRowToStored(data as CourseMapRow);
}

export async function createCourseMapForUser(
  userId: string,
  payload: CourseMapPayload,
  sourceText: string
): Promise<StoredCourseMap> {
  const now = Date.now();
  const record: StoredCourseMap = {
    ...payload,
    id: crypto.randomUUID(),
    userId,
    sourceText,
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await getSupabaseAdmin()
    .from("course_maps")
    .insert(storedToCourseMapRow(record));

  if (error) throw new Error(error.message);
  return record;
}

export async function updateCourseMapForUser(
  userId: string,
  id: string,
  payload: CourseMapPayload,
  additionalSourceText: string
): Promise<StoredCourseMap | null> {
  const existing = await getCourseMapForUser(userId, id);
  if (!existing) return null;

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

  const { error } = await getSupabaseAdmin()
    .from("course_maps")
    .update(storedToCourseMapRow(record))
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("updateCourseMapForUser:", error.message);
    return null;
  }
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

  const { error } = await getSupabaseAdmin()
    .from("course_maps")
    .update({ user_id: toOwnerId })
    .eq("user_id", fromOwnerId);

  if (error) {
    console.error("migrateLibraryOwner:", error.message);
    throw new Error(error.message);
  }
}
