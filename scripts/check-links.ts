/**
 * Internal Link Verification Script
 * Validates that all internal links in the codebase resolve to existing routes (no 404s)
 * and detects forbidden patterns like `href="#"` or empty `href=""`.
 */

import fs from "fs";
import path from "path";

// Define known static and dynamic route patterns supported by the Next.js app
const KNOWN_ROUTES = [
  "/",
  "/about",
  "/admin",
  "/admin/audit",
  "/admin/content",
  "/admin/employees",
  "/admin/inbox",
  "/admin/orders",
  "/awaiting-approval",
  "/contact",
  "/dashboard",
  "/dashboard/orders/new",
  "/dashboard/settings",
  "/employee",
  "/employee/profile",
  "/faq",
  "/forgot-password",
  "/hardware",
  "/how-we-work",
  "/join",
  "/login",
  "/packages",
  "/portfolio",
  "/privacy",
  "/services",
  "/signup",
  "/team",
  "/terms",
  "/testimonials",
];

// Patterns for dynamic segments
const DYNAMIC_ROUTE_PREFIXES = [
  "/services/",
  "/portfolio/",
  "/team/",
  "/dashboard/orders/",
  "/employee/orders/",
  "/admin/orders/",
];

function getAllFiles(dir: string, ext = [".tsx", ".ts", ".jsx", ".js"]): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext));
    } else {
      if (ext.includes(path.extname(file))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function normalizeRoute(href: string): string {
  // Strip anchor and query parameters
  const withoutAnchor = href.split("#")[0];
  const withoutQuery = withoutAnchor.split("?")[0];
  return withoutQuery || "/";
}

function isValidInternalRoute(href: string): boolean {
  const norm = normalizeRoute(href);

  // If it's a dynamic template literal expression, consider it dynamic
  if (norm.includes("${") || norm.includes("{")) {
    return true;
  }

  // Check static match
  if (KNOWN_ROUTES.includes(norm)) return true;

  // Check dynamic route patterns
  for (const prefix of DYNAMIC_ROUTE_PREFIXES) {
    if (norm.startsWith(prefix) && norm.length > prefix.length) {
      return true;
    }
  }

  // Check public assets
  const publicPath = path.join(process.cwd(), "public", norm);
  if (fs.existsSync(publicPath)) {
    return true;
  }

  return false;
}

async function checkServerHealth(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeout);
    return res.status < 500;
  } catch {
    return false;
  }
}

async function runLinkCheck() {
  console.log("\x1b[36m[Link Checker]\x1b[0m Scanning codebase for internal links and empty anchors...");

  const srcDir = path.join(process.cwd(), "src");
  const files = getAllFiles(srcDir);

  const errors: { file: string; line: number; message: string; snippet: string }[] = [];
  const internalHrefsFound = new Set<string>();

  const hrefRegex = /href=(?:["']([^"']*)["']|\{[`"']([^`"']*)[`"']\})/g;

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      while ((match = hrefRegex.exec(line)) !== null) {
        const href = (match[1] || match[2] || "").trim();

        // 1. Forbidden placeholder / dead anchors
        if (href === "#" || href === "") {
          errors.push({
            file: relativePath,
            line: i + 1,
            message: `Dead or empty link detected: href="${href}"`,
            snippet: line.trim(),
          });
          continue;
        }

        // 2. Check internal routes
        if (href.startsWith("/")) {
          internalHrefsFound.add(href);
          if (!isValidInternalRoute(href)) {
            errors.push({
              file: relativePath,
              line: i + 1,
              message: `Internal 404 / route not found for: "${href}"`,
              snippet: line.trim(),
            });
          }
        }
      }
    }
  }

  // 3. Optional live server route checks if dev server is up
  const serverUp = await checkServerHealth("http://localhost:3000");
  if (serverUp) {
    console.log("\x1b[32m[Link Checker]\x1b[0m Dev server detected at http://localhost:3000. Testing static endpoints...");
    const routesToTest = Array.from(internalHrefsFound)
      .map(normalizeRoute)
      .filter((r) => !r.includes("[") && !r.includes(":") && !r.includes("${") && !r.includes("{") && !r.startsWith("/api"));

    const uniqueRoutes = Array.from(new Set(routesToTest));
    for (const route of uniqueRoutes) {
      try {
        const res = await fetch(`http://localhost:3000${route}`, { method: "HEAD" });
        if (res.status === 404) {
          errors.push({
            file: "Live Server Check",
            line: 0,
            message: `HTTP 404 returned for route: ${route}`,
            snippet: `GET http://localhost:3000${route}`,
          });
        }
      } catch {
        // Ignore server network errors during HEAD
      }
    }
  }

  if (errors.length > 0) {
    console.error(`\x1b[31m[Link Checker Error]\x1b[0m Found ${errors.length} link violation(s):`);
    for (const err of errors) {
      console.error(`  - ${err.file}:${err.line} -> ${err.message}`);
      if (err.snippet) console.error(`    "${err.snippet}"`);
    }
    process.exit(1);
  }

  console.log(`\x1b[32m[Link Checker Passed]\x1b[0m All internal links (${internalHrefsFound.size} routes checked) resolve with 0 dead links.`);
}

runLinkCheck().catch((err) => {
  console.error("\x1b[31m[Link Checker Fatal]\x1b[0m", err);
  process.exit(1);
});
