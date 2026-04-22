const fileAccessor = require("fs");
const inputData = fileAccessor.readFileSync("/dev/stdin", "utf8");
const dataParts = inputData.split('\n');

const limitVal = parseInt(dataParts[0]);
const numericalList = dataParts[1].split(' ').map(Number);

let finalCount = 0;

const exploreCombinations = (
    currentSelection,
    startIndex
) => {
    if (currentSelection.length === 3) {
        const [idxA, idxB, idxC] = currentSelection;
        const valA = numericalList[idxA];
        const valB = numericalList[idxB];
        const valC = numericalList[idxC];

        const uniqueValues = new Set([valA, valB, valC]);
        if (uniqueValues.size !== 3) {
            return;
        }

        const sortedValues = [valA, valB, valC].sort((first, second) => first - second);
        const smallestSide = sortedValues[0];
        const mediumSide = sortedValues[1];
        const largestSide = sortedValues[2];

        if (smallestSide + mediumSide > largestSide) {
            finalCount++;
        }
        return;
    }

    for (let currentIdx = startIndex; currentIdx < limitVal; currentIdx++) {
        currentSelection.push(currentIdx);
        exploreCombinations(currentSelection, currentIdx + 1);
        currentSelection.pop();
    }
};

exploreCombinations([], 0);

console.log(finalCount);