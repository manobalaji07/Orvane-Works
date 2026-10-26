import { describe, it, expect } from "vitest";
import { formatINR, formatDate, cn } from "../lib/utils";
import { validateUploadFile, MAX_FILE_SIZE_BYTES } from "../lib/storage";

describe("Utility Functions", () => {
  it("formats Indian Rupee currency correctly with rupee symbol and comma grouping", () => {
    const formatted = formatINR(150000);
    // Should format in Indian numbering style (e.g. ₹1,50,000)
    expect(formatted).toContain("1,50,000");
  });

  it("formats dates properly into readable format", () => {
    const date = new Date("2026-05-15T00:00:00Z");
    const formatted = formatDate(date);
    expect(formatted).toContain("2026");
    expect(formatted).toContain("May");
  });

  it("merges tailwind classes cleanly using cn()", () => {
    const result = cn("px-4 py-2", "px-6", { "bg-primary": true });
    expect(result).toBe("py-2 px-6 bg-primary");
  });

  describe("Server File Upload Security Validation", () => {
    it("allows valid deliverables (PDF, ZIP, MP4, PNG)", () => {
      expect(validateUploadFile("project-report.pdf", 500000, "application/pdf").valid).toBe(true);
      expect(validateUploadFile("archive.zip", 5000000, "application/zip").valid).toBe(true);
      expect(validateUploadFile("render.mp4", 25000000, "video/mp4").valid).toBe(true);
    });

    it("strictly blocks executable files (.exe, .bat, .sh, .msi, .ps1)", () => {
      expect(validateUploadFile("script.exe", 1024, "application/x-msdownload").valid).toBe(false);
      expect(validateUploadFile("run.bat", 1024, "text/plain").valid).toBe(false);
      expect(validateUploadFile("deploy.sh", 1024, "application/x-sh").valid).toBe(false);
      expect(validateUploadFile("install.msi", 1024, "application/octet-stream").valid).toBe(false);
      expect(validateUploadFile("hack.ps1", 1024, "text/plain").valid).toBe(false);
    });

    it("rejects files exceeding the 100MB size limit", () => {
      const overLimit = MAX_FILE_SIZE_BYTES + 1;
      const res = validateUploadFile("huge-video.mp4", overLimit, "video/mp4");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("100MB");
    });
  });
});
