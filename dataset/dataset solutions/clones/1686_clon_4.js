const fs = require("fs");

const value = Number(fs.readFileSync(0, "utf8").trim());
const remainder = value - Math.floor(value / 1000) * 1000;
const answer = remainder === 0 ? 0 : 1000 - remainder;

process.stdout.write(String(answer));