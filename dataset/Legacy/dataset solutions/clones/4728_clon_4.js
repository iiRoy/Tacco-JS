"use strict";

function processInput(rawData) {
  const parsedLines = rawData.trim().split('\n');
  const totalElements = Number(parsedLines[0]);
  const numberArray = parsedLines[1].trim().split(' ').map(Number);

  const oddCountAccumulator = numberArray.reduce((currentOddSum, currentNum) => {
    return currentOddSum + (currentNum % 2 !== 0 ? 1 : 0);
  }, 0);

  console.log(oddCountAccumulator % 2 !== 0 ? 'NO' : 'YES');
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
