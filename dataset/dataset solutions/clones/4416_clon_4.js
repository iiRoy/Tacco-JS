const dataContent = require("node:fs").readFileSync("/dev/stdin", "utf8");

const [firstVal, secondVal, thirdVal, fourthVal] = dataContent
  .trim()
  .split(/\s+/)
  .map(Number);

const intersectionResult = Math.max(
  0,
  Math.min(secondVal, fourthVal) - Math.max(firstVal, thirdVal)
);

process.stdout.write(String(intersectionResult) + "\n");