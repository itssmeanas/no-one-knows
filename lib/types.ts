// lib/types.ts

export type ConfessionCategory =
  | "I still love them"
  | "I lied"
  | "I miss someone"
  | "I regret it"
  | "I am scared"
  | "I feel alone"
  | "I am pretending"
  | "I never told anyone"
  | "I wish I could go back"
  | "I cannot forgive myself"
  | "Other";

export type ConfessionVisibility = "public" | "private";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ReactionType = "felt_this";

export type ReportReason =
  | "Names or personal information"
  | "Harassment or revenge posting"
  | "Threats or violence"
  | "Hate or discrimination"
  | "Self-harm concern"
  | "Sexual content"
  | "Spam"
  | "Other";

export type ReportStatus = "pending" | "reviewed" | "dismissed";

export type AppSettingKey =
  | "submissions_enabled"
  | "reactions_enabled"
  | "approval_mode_enabled"
  | "private_confessions_enabled"
  | "minimum_confession_length"
  | "maximum_confession_length";

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | { readonly [key: string]: JsonValue }
  | readonly JsonValue[];

export type ConfessionRow = {
  id: string;
  public_id: string;
  title: string | null;
  category: ConfessionCategory;
  body: string;
  visibility: ConfessionVisibility;
  is_anonymous: boolean;
  approval_status: ApprovalStatus;
  is_hidden: boolean;
  is_deleted: boolean;
  manage_token_hash: string;
  felt_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
  hidden_at: string | null;
  deleted_at: string | null;
};

export type ConfessionInsert = {
  public_id: string;
  title?: string | null;
  category: ConfessionCategory;
  body: string;
  visibility?: ConfessionVisibility;
  is_anonymous?: boolean;
  approval_status?: ApprovalStatus;
  is_hidden?: boolean;
  is_deleted?: boolean;
  manage_token_hash: string;
  felt_count?: number;
  report_count?: number;
  hidden_at?: string | null;
  deleted_at?: string | null;
};

export type ConfessionUpdate = Partial<
  Pick<
    ConfessionRow,
    | "title"
    | "category"
    | "body"
    | "visibility"
    | "approval_status"
    | "is_hidden"
    | "is_deleted"
    | "hidden_at"
    | "deleted_at"
  >
>;

export type PublicConfession = {
  publicId: string;
  title: string | null;
  category: ConfessionCategory;
  body: string;
  feltCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ManageableConfession = {
  publicId: string;
  title: string | null;
  category: ConfessionCategory;
  body: string;
  visibility: ConfessionVisibility;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReactionRow = {
  id: string;
  confession_id: string;
  reaction_type: ReactionType;
  anonymous_session_id: string | null;
  ip_hash: string | null;
  created_at: string;
};

export type ReactionInsert = {
  confession_id: string;
  reaction_type?: ReactionType;
  anonymous_session_id?: string | null;
  ip_hash?: string | null;
};

export type ReportRow = {
  id: string;
  confession_id: string;
  reason: ReportReason;
  details: string | null;
  anonymous_session_id: string | null;
  ip_hash: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type ReportInsert = {
  confession_id: string;
  reason: ReportReason;
  details?: string | null;
  anonymous_session_id?: string | null;
  ip_hash?: string | null;
  status?: ReportStatus;
};

export type ReportUpdate = Partial<
  Pick<ReportRow, "status" | "reviewed_at" | "reviewed_by">
>;

export type AppSettingRow = {
  id: string;
  key: AppSettingKey;
  value: string | null;
  updated_at: string;
};

export type AppSettingUpdate = {
  value: string | null;
};

export type AuditLogRow = {
  id: string;
  admin_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: JsonValue;
  created_at: string;
};

export type AuditLogInsert = {
  admin_user_id?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: JsonValue;
};

export type AdminConfessionListItem = ConfessionRow;

export type AdminReportListItem = ReportRow & {
  confession: Pick<
    ConfessionRow,
    "id" | "public_id" | "title" | "category" | "body" | "is_hidden" | "is_deleted"
  > | null;
};

export type Database = {
  public: {
    Tables: {
      confessions: {
        Row: ConfessionRow;
        Insert: ConfessionInsert;
        Update: ConfessionUpdate;
      };
      reactions: {
        Row: ReactionRow;
        Insert: ReactionInsert;
        Update: never;
      };
      reports: {
        Row: ReportRow;
        Insert: ReportInsert;
        Update: ReportUpdate;
      };
      app_settings: {
        Row: AppSettingRow;
        Insert: {
          key: AppSettingKey;
          value?: string | null;
        };
        Update: AppSettingUpdate;
      };
      audit_logs: {
        Row: AuditLogRow;
        Insert: AuditLogInsert;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_confession_felt_count: {
        Args: {
          target_confession_id: string;
        };
        Returns: void;
      };
      increment_confession_report_count: {
        Args: {
          target_confession_id: string;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export function toPublicConfession(row: ConfessionRow): PublicConfession {
  return {
    publicId: row.public_id,
    title: row.title,
    category: row.category,
    body: row.body,
    feltCount: row.felt_count,
    reportCount: row.report_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toManageableConfession(row: ConfessionRow): ManageableConfession {
  return {
    publicId: row.public_id,
    title: row.title,
    category: row.category,
    body: row.body,
    visibility: row.visibility,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}