const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
const inputLineSegments = rawInputContent.split("\n");

const targetIterationCount = parseInt(inputLineSegments[0], 10);

const rawNumberStrings = inputLineSegments[1].split(" ");
const parsedNumericValues = rawNumberStrings.map(singleString => parseInt(singleString, 10));
const sortedDescendingNumbers = parsedNumericValues.sort((valueA, valueB) => valueB - valueA);

let accumulatedTotal = 0;

for (let currentLoopIteration = 0, arrayAccessIndex = 1;
     currentLoopIteration < targetIterationCount;
     currentLoopIteration++) {
  const valueToAdd = sortedDescendingNumbers[arrayAccessIndex];
  accumulatedTotal += valueToAdd;
  arrayAccessIndex += 2;
}

console.log(accumulatedTotal);
