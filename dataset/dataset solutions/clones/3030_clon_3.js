function evaluateRange(rawStringData) {
  const trimmedData = rawStringData.trim();
  const numericValues = trimmedData.split(" ").map(Number);

  const firstValue = numericValues[0];
  const secondValue = numericValues[1];
  const targetValue = numericValues[2];

  const lowerBound = Math.min(firstValue, secondValue);
  const upperBound = Math.max(firstValue, secondValue);

  const isWithinRange = (targetValue >= lowerBound && targetValue <= upperBound);

  console.log(isWithinRange ? "Yes" : "No");
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const inputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

evaluateRange(inputContent);
