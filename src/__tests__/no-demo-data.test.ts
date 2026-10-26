import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

describe("Strict Demo Data Audit", () => {
  const forbiddenPatterns = [
    "[Demo]",
    "orvane" + ".studio",
    "student." + "tce.edu",
    "Dinesh" + " Pandian",
    "Karthik" + " Raja",
    "Karthik" + " Rajan",
    "Priya" + " Sundaram",
    "Arun" + " Kumar",
    "ORV-2026-" + "0001",
    "ORV-2026-" + "0002",
  ];

  it("ensures no forbidden demo strings or demo personal data exist in src or public", () => {
    const rootDir = process.cwd();
    const srcFiles = getAllFiles(path.join(rootDir, "src"));
    const publicFiles = getAllFiles(path.join(rootDir, "public"));
    const allFiles = [...srcFiles, ...publicFiles];

    const violations: { file: string; match: string; line: number }[] = [];

    for (const filePath of allFiles) {
      // Exclude this test file itself to avoid self-match
      if (filePath.endsWith("no-demo-data.test.ts")) {
        continue;
      }

      // Check text files only
      const ext = path.extname(filePath).toLowerCase();
      const binaryExtensions = [".png", ".jpg", ".jpeg", ".ico", ".webp", ".woff", ".woff2", ".ttf", ".pdf", ".zip"];
      if (binaryExtensions.includes(ext)) {
        continue;
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of forbiddenPatterns) {
          if (line.includes(pattern)) {
            violations.push({
              file: path.relative(rootDir, filePath),
              match: pattern,
              line: i + 1,
            });
          }
        }
      }
    }

    expect(
      violations,
      `Found demo violations in codebase:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> matches forbidden "${v.match}"`)
        .join("\n")}`
    ).toEqual([]);
  });
});
