const fs = require("fs");

const values = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const deltaX = values[2] - values[0];
const deltaY = values[3] - values[1];

process.stdout.write(Math.hypot(deltaX, deltaY).toFixed(8));