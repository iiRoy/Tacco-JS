const fileSystemManager = require("node:fs");
const inputLineContent = fileSystemManager.readFileSync("/dev/stdin", "utf8");
const limit = Number.parseInt(inputLineContent.trim(), 10);

const divisorCountsArray = new Array(limit + 1).fill(0);

for (let currentFactor = 1; currentFactor <= limit; currentFactor++) {
    for (let currentMultiple = currentFactor; currentMultiple <= limit; currentMultiple += currentFactor) {
        divisorCountsArray[currentMultiple]++;
    }
}

let totalSum = divisorCountsArray.slice(1).reduce((accumulatedValue, countOfDivisors, zeroBasedIndex) => {
    const actualNumber = zeroBasedIndex + 1; 
    return accumulatedValue + (actualNumber * countOfDivisors);
}, 0);

console.log(totalSum);