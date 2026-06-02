"use strict";

function processInput(rawData) {
  const lineSegments = rawData.trim().split("\n");

  const firstLineContent = lineSegments[0].trim();
  const numElementsToProcess = parseInt(firstLineContent, 10);

  const secondLineContent = lineSegments[1].trim();
  const stringNumbers = secondLineContent.split(" ");
  const parsedNumbers = stringNumbers.map(Number);
  
  const sortedValuesDesc = parsedNumbers.sort((valA, valB) => valB - valA);

  let finalSum = 0;
  let loopIndex = 0;

  while (loopIndex < numElementsToProcess) {
    const currentOffset = loopIndex * 2;
    const targetArrayIndex = currentOffset + 1;
    const valueToAdd = sortedValuesDesc[targetArrayIndex];
    finalSum += valueToAdd;
    loopIndex++;
  }

  console.log(finalSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
