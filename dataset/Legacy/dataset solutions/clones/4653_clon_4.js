const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

const countToTake = Number(inputLines[0]);

const sortedValues = inputLines[1].split(" ").map(Number).sort((valA, valB) => valB - valA);

const targetIndices = Array.from({ length: countToTake }, (_, indexOffset) => 1 + 2 * indexOffset);

const totalAccumulator = targetIndices.reduce((currentSum, currentIdx) => currentSum + sortedValues[currentIdx], 0);

console.log(totalAccumulator);
