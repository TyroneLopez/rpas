import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://wkgacywvsndwiezqdcxj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZ2FjeXd2c25kd2llenFkY3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzU3MDksImV4cCI6MjA4ODcxMTcwOX0.jRJR4F-rN4xF87maTcpzi4OB3oFbQFEI6Vg8TYd2uno"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Status constants
export const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  in_progress: "In Progress",
  for_revision: "For Revision",
  resubmitted: "Resubmitted",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const STATUS_COLORS = {
  submitted: "#6B7280",
  under_review: "#F59E0B",
  in_progress: "#3B82F6",
  for_revision: "#EF4444",
  completed: "#1A6B30",
  cancelled: "#9CA3AF",
}

export const SERVICES = [
  "Quantitative Data Analysis",
  "Qualitative Data Analysis",
  "Questionnaire Validation",
  "Reliability Test",
  "Manuscript Review",
  "Research Consultation",
]

export const STATUS_STEPS = [
  "submitted",
  "under_review",
  "in_progress",
  "for_revision",
  "completed",
]

export const ROLES = {
  ADMIN: "admin",
  ANALYST: "analyst",
  RESEARCHER: "researcher",
}