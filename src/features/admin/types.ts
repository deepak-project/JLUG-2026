import { RecruitmentFormData } from "@/features/recruitment/types";

export interface Submission extends RecruitmentFormData {
  id: string;
  submittedAt: string;
}
