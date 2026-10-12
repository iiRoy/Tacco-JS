'use strict';

function ProcessInputAndOutput(rawData) {
  const polygonSides = Number(rawData);
  const triangleCount = polygonSides - 2;
  let totalAngleSum;

  if (triangleCount === 0) {
    totalAngleSum = 0;
  } else if (triangleCount > 0) {
    totalAngleSum = Array.from({ length: triangleCount }).reduce((currentSum) => currentSum + 180, 0);
  } else {
    totalAngleSum = Array.from({ length: Math.abs(triangleCount) }).reduce((currentSum) => currentSum - 180, 0);
  }

  console.log(totalAngleSum);
}

ProcessInputAndOutput(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());
