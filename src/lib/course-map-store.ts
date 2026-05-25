import type { CourseMapPayload } from "@/types/course";
import type { CourseMapData } from "@/types/course";
import {
  createCourseMapForUser,
  getCourseMapById,
  storedToClientData,
} from "@/lib/course-library-store";

export async function saveCourseMap(
  userId: string,
  data: CourseMapPayload,
  sourceText: string
): Promise<CourseMapData> {
  const record = await createCourseMapForUser(userId, data, sourceText);
  return storedToClientData(record);
}

export async function getCourseMap(id: string): Promise<CourseMapData | null> {
  const record = await getCourseMapById(id);
  if (!record) return null;
  return storedToClientData(record);
}
