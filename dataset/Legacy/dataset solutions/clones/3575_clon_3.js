"use strict";
function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const firstLineTokens = inputLines[0].split(" ");

  const numN = parseInt(firstLineTokens[0], 10);
  const numK = parseInt(firstLineTokens[1], 10);

  const calculateCube = (valueToCube) => valueToCube * valueToCube * valueToCube;

  const floorNOverK = Math.floor(numN / numK);
  const firstTermResult = calculateCube(floorNOverK);

  let finalComputedValue;

  const isKEven = (numK % 2 === 0);

  if (isKEven) {
    const halfK = numK / 2;
    const floorNPlusHalfKOverK = Math.floor((numN + halfK) / numK);
    const secondTermResult = calculateCube(floorNPlusHalfKOverK);
    finalComputedValue = firstTermResult + secondTermResult;
  } else {
    finalComputedValue = firstTermResult;
  }

  console.log(finalComputedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
