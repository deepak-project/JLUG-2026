import { FormErrors, FormFieldKey, RecruitmentFormData } from "./types";

/** Validate a single field value and return an error message, or undefined. Shared by client and API. */
export function validateField(key: FormFieldKey, value: unknown): string | undefined {
  switch (key) {
    case "fullName": {
      const v = String(value ?? "").trim();
      if (!v) return "Name is required.";
      if (v.length < 3) return "Name must be at least 3 characters.";
      return undefined;
    }
    case "branch":
      return value ? undefined : "Please select your branch.";
    case "year":
      return value ? undefined : "Please select your academic year.";
    case "phone": {
      const v = String(value ?? "").replace(/[\s-]/g, "");
      if (!v) return "Phone number is required.";
      if (!/^[6-9]\d{9}$/.test(v)) return "Enter a valid 10-digit Indian phone number.";
      return undefined;
    }
    case "email": {
      const v = String(value ?? "").trim();
      if (!v) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
      return undefined;
    }
    case "domains": {
      const arr = value as string[];
      return Array.isArray(arr) && arr.length > 0 ? undefined : "Select at least one domain.";
    }
    case "whyJoin": {
      const v = String(value ?? "").trim();
      if (!v) return "Please tell us your motivation.";
      if (v.length < 20) return `At least 20 characters needed (${v.length} so far).`;
      return undefined;
    }
    default:
      return undefined;
  }
}

export function validateForm(data: RecruitmentFormData): FormErrors {
  const errs: FormErrors = {};
  (Object.keys(data) as FormFieldKey[]).forEach((key) => {
    const msg = validateField(key, data[key]);
    if (msg) errs[key] = msg;
  });
  return errs;
}
