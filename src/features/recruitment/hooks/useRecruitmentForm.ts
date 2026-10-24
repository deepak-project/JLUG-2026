import { useState, useCallback, useMemo } from "react";
import { FormErrors, FormFieldKey, RecruitmentFormData } from "../types";
import { INITIAL_FORM_DATA } from "../data/recruitmentOptions";
import { validateField, validateForm } from "../validation";

export function useRecruitmentForm() {
  const [formData, setFormData] = useState<RecruitmentFormData>(INITIAL_FORM_DATA);
  const [touched, setTouched] = useState<Record<FormFieldKey, boolean>>({
    fullName: false,
    branch: false,
    year: false,
    phone: false,
    email: false,
    domains: false,
    whyJoin: false,
  });

  /** Derived validation errors for every field. */
  const errors = useMemo<FormErrors>(() => validateForm(formData), [formData]);

  const isValid = Object.keys(errors).length === 0;

  /** Count how many fields are individually passing validation. */
  const completedCount = useMemo(() => {
    let n = 0;
    if (!validateField("fullName", formData.fullName)) n++;
    if (!validateField("branch", formData.branch)) n++;
    if (!validateField("year", formData.year)) n++;
    if (!validateField("phone", formData.phone)) n++;
    if (!validateField("email", formData.email)) n++;
    if (!validateField("domains", formData.domains)) n++;
    if (!validateField("whyJoin", formData.whyJoin)) n++;
    return n;
  }, [formData]);

  // ─── Field handlers ───────────────────────────────────────────────────────

  const handleTextChange = useCallback(
    (field: "fullName" | "phone" | "email" | "whyJoin") =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: val }));
      },
    []
  );

  const handleBranchSelect = useCallback((branchCode: string) => {
    setFormData((prev) => ({ ...prev, branch: branchCode }));
    setTouched((prev) => ({ ...prev, branch: true }));
  }, []);

  const handleYearSelect = useCallback((yearVal: string) => {
    setFormData((prev) => ({ ...prev, year: yearVal }));
    setTouched((prev) => ({ ...prev, year: true }));
  }, []);

  const handleDomainToggle = useCallback((domainId: string) => {
    setFormData((prev) => {
      const exists = prev.domains.includes(domainId);
      const next = exists
        ? prev.domains.filter((d) => d !== domainId)
        : [...prev.domains, domainId];
      return { ...prev, domains: next };
    });
    setTouched((prev) => ({ ...prev, domains: true }));
  }, []);

  const handleBlur = useCallback((field: FormFieldKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  /** Validates, then POSTs to /api/recruitment. Errors surface inline. */
  const submitApplication = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched({
        fullName: true,
        branch: true,
        year: true,
        phone: true,
        email: true,
        domains: true,
        whyJoin: true,
      });
      if (!isValid || status === "submitting") return;

      setStatus("submitting");
      setSubmitError("");
      try {
        const res = await fetch("/api/recruitment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Submission failed.");
        setStatus("success");
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Submission failed.");
        setStatus("error");
      }
    },
    [isValid, status, formData]
  );

  const resetForm = useCallback(() => {
    setStatus("idle");
    setSubmitError("");
    setFormData(INITIAL_FORM_DATA);
    setTouched({
      fullName: false,
      branch: false,
      year: false,
      phone: false,
      email: false,
      domains: false,
      whyJoin: false,
    });
  }, []);

  return {
    formData,
    touched,
    errors,
    isValid,
    completedCount,
    handleTextChange,
    handleBranchSelect,
    handleYearSelect,
    handleDomainToggle,
    handleBlur,
    submitApplication,
    resetForm,
    status,
    submitError,
  };
}
