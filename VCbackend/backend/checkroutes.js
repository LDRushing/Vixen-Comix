// checkRoutes.js
import fs from "fs";
import path from "path";

const backendDir = "./"; // adjust if needed

function scanFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      scanFiles(fullPath);
    } else if (file.isFile() && fullPath.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const urlPattern = /(app\.use|router\.(get|post|patch|delete))\(["']https?:\/\/[^\s'"]+["']/g;

      const matches = content.match(urlPattern);
      if (matches) {
        console.log(`⚠️ Found full URL route in ${fullPath}:`);
        matches.forEach((m) => console.log("  ", m));
      }
    }
  }
}

scanFiles(backendDir);
