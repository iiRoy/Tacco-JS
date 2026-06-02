const fs = require("fs");

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");

const n = Number(lines.shift());
const originalNumbers = lines.shift().split(" ").map(Number);
const orderedNumbers = originalNumbers.slice().sort((a, b) => a - b);
const operationLimit = Number(lines.shift());

const operations = lines.map(line => line.split(" ").map(value => Number(value) - 1));
operations.unshift([0, 0]);

const activeIndexes = [];
const currentValues = [];
const targetValues = [];

for (let index = 0; index < n; index++) {
    if (originalNumbers[index] !== orderedNumbers[index]) {
        activeIndexes.push(index);
        currentValues.push(originalNumbers[index]);
        targetValues.push(orderedNumbers[index]);
    }
}

const positionInActiveList = {};
activeIndexes.forEach((index, place) => {
    positionInActiveList[index] = place;
});

const targetSignature = targetValues.join(",");
let answer = -1;

for (let step = 0; step <= operationLimit; step++) {
    const [leftIndex, rightIndex] = operations[step];

    const leftPlace = positionInActiveList[leftIndex];
    const rightPlace = positionInActiveList[rightIndex];

    if (leftPlace !== undefined || rightPlace !== undefined) {
        const leftValue = leftPlace !== undefined ? currentValues[leftPlace] : undefined;
        const rightValue = rightPlace !== undefined ? currentValues[rightPlace] : undefined;

        if (leftPlace !== undefined) currentValues[leftPlace] = rightValue;
        if (rightPlace !== undefined) currentValues[rightPlace] = leftValue;
    }

    if (currentValues.join(",") === targetSignature) {
        answer = step;
        break;
    }
}

console.log(answer);