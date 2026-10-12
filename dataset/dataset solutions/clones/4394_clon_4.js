const fs = require("fs");

const [point, left, right] = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);

let winner = "A";
const da = (point - left) * (point - left);
const db = (point - right) * (point - right);

if (db < da) {
  winner = "B";
}

process.stdout.write(winner);