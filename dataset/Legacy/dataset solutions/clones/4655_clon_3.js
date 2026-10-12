"use strict"
function processInputData(rawInputString) {
  rawInputString = rawInputString.trim();
  const lines = rawInputString.split('\n');

  const itemCount = Number(lines[0].trim());
  
  const rawNumbersString = lines[1].trim();
  const parsedNumbers = rawNumbersString.split(' ').map(Number);
  const descSortedValues = parsedNumbers.sort((valA, valB) => valB - valA);

  let accumulatedSum = 0;
  const loopUpperLimit = itemCount * 3;

  for (let currentIndex = 2; currentIndex < loopUpperLimit; currentIndex += 2) {
    accumulatedSum += descSortedValues[currentIndex];
  }

  console.log(accumulatedSum);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
