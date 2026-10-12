const fs = require("fs");

const radius = Number(fs.readFileSync(0, "utf8").trim());

const diameter = radius + radius;
const area = Math.PI * Math.pow(radius, 2);
const circumference = Math.PI * diameter;

process.stdout.write([area, circumference].map(v => v.toFixed(6)).join(" "));