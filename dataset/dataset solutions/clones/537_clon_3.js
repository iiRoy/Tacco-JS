const fs = require('fs');

const parseInteger = (str) => parseInt(str, 10);

const parseNumberArray = (str) => str.split(" ").map(Number);

const generateDiffString = (diffObject) => {
    let resultString = "";
    for (const mapIndex in diffObject) {
        resultString += diffObject[mapIndex];
    }
    return resultString;
};

const fileContent = fs.readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

const initialArrayLength = parseInteger(inputLines.shift());
const initialValues = parseNumberArray(inputLines.shift());
const sortedInitialValues = initialValues.slice().sort((valA, valB) => valA - valB);

const numQueries = parseInteger(inputLines.shift());
const swapOperations = inputLines.map(element => parseNumberArray(element).map(val => val - 1));

swapOperations.unshift([0, 0]);

const currentDiffMap = {};
const targetDiffMap = {};

let initialMismatchCount = 0;

for (let idx = 0; idx < initialArrayLength; idx++) {
    if (initialValues[idx] !== sortedInitialValues[idx]) {
        currentDiffMap[idx] = initialValues[idx];
        targetDiffMap[idx] = sortedInitialValues[idx];
        initialMismatchCount++;
    }
}

const targetDiffString = generateDiffString(targetDiffMap);

let matchFound = false;
let queryIndex = 0;

while (queryIndex <= numQueries) {
    const currentSwapPair = swapOperations[queryIndex];
    const firstSwapIdx = currentSwapPair[0];
    const secondSwapIdx = currentSwapPair[1];

    const tempVal1 = currentDiffMap[firstSwapIdx];
    const tempVal2 = currentDiffMap[secondSwapIdx];
    currentDiffMap[firstSwapIdx] = tempVal2;
    currentDiffMap[secondSwapIdx] = tempVal1;

    const currentDiffString = generateDiffString(currentDiffMap);

    if (currentDiffString === targetDiffString) {
        matchFound = true;
        break;
    }
    queryIndex++;
}

if (initialMismatchCount === 0) {
    console.log(0);
} else if (matchFound) {
    console.log(queryIndex);
} else {
    console.log(-1);
}
