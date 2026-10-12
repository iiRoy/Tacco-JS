const fs = require("fs");

const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\n/);
const pos = Number(lines[0].trim().split(/\s+/)[1]) - 1;
const text = lines[1];

process.stdout.write(
  text.slice(0, pos) + text.charAt(pos).toLowerCase() + text.slice(pos + 1)
);