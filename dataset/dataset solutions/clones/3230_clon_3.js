"use strict";

function padBinaryString(binaryStringValue, targetLength) {
  const currentLength = binaryStringValue.length;
  if (currentLength >= targetLength) {
    return binaryStringValue;
  }
  const padding = "0".repeat(targetLength - currentLength);
  return padding + binaryStringValue;
}

function bitwiseXOR(valA, xorVal) {
  let binA = valA.toString(2);
  let binX = xorVal.toString(2);

  const maxLength = Math.max(binA.length, binX.length);

  binA = padBinaryString(binA, maxLength);
  binX = padBinaryString(binX, maxLength);

  let xorResultBinary = "";
  for (let idx = 0; idx < maxLength; idx++) {
    const bitA = binA[idx];
    const bitX = binX[idx];
    xorResultBinary += (bitA === bitX ? "0" : "1");
  }
  return parseInt(xorResultBinary, 2);
}

function main(rawData) {
  const parsedLines = rawData.split("\n").filter(line => line.trim() !== "");

  const firstLineParts = parsedLines[0].split(" ").map(Number);
  const countN = firstLineParts[0]; // N is not used in the original logic, so it remains unused.
  const limitK = firstLineParts[1];
  const numbersArray = parsedLines[1].split(" ").map(Number);

  const determineMaxBinaryLength = (arr) => {
    if (arr.length === 0) return 0;
    const sortedArr = [...arr].sort((a, b) => a - b);
    const maxValue = sortedArr[sortedArr.length - 1];
    return maxValue.toString(2).length;
  };

  const maxBinaryLength = determineMaxBinaryLength(numbersArray);

  const binaryStringsArray = numbersArray.map(num => {
    const currentBinary = num.toString(2);
    return padBinaryString(currentBinary, maxBinaryLength);
  });

  let optimalXBinary = "";
  for (let idx = 0; idx < maxBinaryLength; idx++) {
    let zeroCount = 0;
    let oneCount = 0;

    for (const currentBinaryString of binaryStringsArray) {
      const charAtPosition = currentBinaryString[idx];
      if (charAtPosition === "0") {
        zeroCount++;
      } else {
        oneCount++;
      }
    }

    const chosenBit = (zeroCount > oneCount) ? "1" : "0";
    optimalXBinary += chosenBit;
  }

  const kBinaryLength = limitK.toString(2).length;
  let adjustedOptimalXBinary = optimalXBinary;

  if (limitK === 0) {
    adjustedOptimalXBinary = "0";
  } else if (optimalXBinary.length < kBinaryLength) {
    adjustedOptimalXBinary = "1".repeat(kBinaryLength - optimalXBinary.length) + optimalXBinary;
  } else if (optimalXBinary.length > kBinaryLength) {
    adjustedOptimalXBinary = optimalXBinary.slice(optimalXBinary.length - kBinaryLength);
  }
  
  const finalXValue = parseInt(adjustedOptimalXBinary, 2);

  const totalXORSum = numbersArray.map(num => bitwiseXOR(num, finalXValue))
                                 .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  console.log(totalXORSum);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
