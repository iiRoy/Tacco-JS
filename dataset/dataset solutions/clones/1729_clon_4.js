const fileSystem = require("fs");

const calculateTriangular = (bound) => {
  if (bound < 0) return 0;
  return bound * (bound + 1) / 2;
};

const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const limitNumber = Number(inputContent.trim());

let cumulativeSum = 0;

let currentDivisor = 1;
while (currentDivisor <= limitNumber) {
  const blockValue = Math.floor(limitNumber / currentDivisor);
  const blockEndDivisor = Math.floor(limitNumber / blockValue);

  const sumDivisorsInBlock = calculateTriangular(blockEndDivisor) - calculateTriangular(currentDivisor - 1);
  
  cumulativeSum += sumDivisorsInBlock * calculateTriangular(blockValue);

  currentDivisor = blockEndDivisor + 1;
}

console.log(cumulativeSum);