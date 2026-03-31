const fs = require("fs");
const { execFileSync } = require("child_process");

try {
    execFileSync("node", ["scripts/build_artifacts.js", "--check"], { stdio: "pipe" });
} catch (error) {
    console.log("BUILD ARTIFACTS OUT OF DATE");
    if (error.stdout) process.stdout.write(error.stdout.toString());
    if (error.stderr) process.stdout.write(error.stderr.toString());
    process.exit(1);
}

const html = fs.readFileSync("pv_calculator_ui.html", "utf8");
const scripts = [];
const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m;
while ((m = re.exec(html)) !== null) scripts.push(m[1]);
try {
    new Function(scripts.join("\n"));
    console.log("SYNTAX OK | Lines:", html.split("\n").length, "| Size:", (fs.statSync("pv_calculator_ui.html").size / 1024).toFixed(1), "KB");
} catch(e) {
    console.log("SYNTAX ERROR:", e.message);
    // Find approximate line
    const combined = scripts.join("\n");
    const lines = combined.split("\n");
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
        let pos = parseInt(posMatch[1]), count = 0;
        for (let i = 0; i < lines.length; i++) {
            count += lines[i].length + 1;
            if (count >= pos) { console.log("Near script line", i+1, ":", lines[i].substring(0, 120)); break; }
        }
    }
}
