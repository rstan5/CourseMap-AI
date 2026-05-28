import type { CourseMapPayload } from "@/types/course";
import type { StoredCourseMap } from "@/types/course-library";
import type { StoredUser } from "@/lib/auth/users";
import type { UserAccessRecord } from "@/types/user-access";

export interface CourseMapRow {
  id: string;
  user_id: string;
  course_map_overview: CourseMapPayload["course_map_overview"];
  concept_map: CourseMapPayload["concept_map"];
  learning_graph_edges: CourseMapPayload["learning_graph_edges"];
  learning_sequence: CourseMapPayload["learning_sequence"];
  high_yield_map: CourseMapPayload["high_yield_map"];
  knowledge_gaps: CourseMapPayload["knowledge_gaps"];
  source_text: string;
  created_at: number;
  updated_at: number;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: number;
}

export interface UserAccessRow {
  user_id: string;
  free_map_used: boolean;
  subscription_active: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: number | null;
}

export function courseMapRowToStored(row: CourseMapRow): StoredCourseMap {
  return {
    id: row.id,
    userId: row.user_id,
    course_map_overview: row.course_map_overview,
    concept_map: row.concept_map,
    learning_graph_edges: row.learning_graph_edges ?? [],
    learning_sequence: row.learning_sequence ?? [],
    high_yield_map: row.high_yield_map,
    knowledge_gaps: row.knowledge_gaps ?? [],
    sourceText: row.source_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function storedToCourseMapRow(record: StoredCourseMap): CourseMapRow {
  return {
    id: record.id,
    user_id: record.userId,
    course_map_overview: record.course_map_overview,
    concept_map: record.concept_map,
    learning_graph_edges: record.learning_graph_edges,
    learning_sequence: record.learning_sequence,
    high_yield_map: record.high_yield_map,
    knowledge_gaps: record.knowledge_gaps,
    source_text: record.sourceText,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

export function userRowToStored(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export function accessRowToRecord(row: UserAccessRow | null): UserAccessRecord {
  if (!row) {
    return { freeMapUsed: false, subscriptionActive: false };
  }
  return {
    freeMapUsed: row.free_map_used,
    subscriptionActive: row.subscription_active,
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
  };
}

export function recordToAccessRow(
  userId: string,
  record: UserAccessRecord
): UserAccessRow {
  return {
    user_id: userId,
    free_map_used: record.freeMapUsed,
    subscription_active: record.subscriptionActive,
    stripe_customer_id: record.stripeCustomerId ?? null,
    stripe_subscription_id: record.stripeSubscriptionId ?? null,
    current_period_end: record.currentPeriodEnd ?? null,
  };
}
