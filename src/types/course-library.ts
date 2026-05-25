import type { CourseMapData } from "@/types/course";

export interface CourseMapSummary {
  id: string;
  title: string;
  subject: string;
  updatedAt: number;
  moduleCount: number;
}

export interface StoredCourseMap extends CourseMapData {
  userId: string;
  sourceText: string;
  createdAt: number;
  updatedAt: number;
}

export interface CourseMapsListResponse {
  success: boolean;
  data?: CourseMapSummary[];
  error?: string;
}
