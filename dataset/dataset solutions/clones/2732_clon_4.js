'use strict';
function calculateAndDisplay(rawData) {
  const [firstOperand, secondOperand] = rawData.trim().split(' ').map(Number);

  const divisor = secondOperand * 2;
  const intermediateValue = firstOperand / divisor;

  const floorPart = Math.floor(intermediateValue);
  const finalResult = floorPart + (intermediateValue > floorPart ? 1 : 0);
  
  console.log(finalResult);
}

calculateAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
