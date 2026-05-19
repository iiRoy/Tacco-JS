const isDebugModeActive = false;

const createInputSource = () => {
    if (isDebugModeActive) {
        const simulateInput = (promptText) => {
            return `5
                3 1 4 1 5
                2 7 1 8 2
                `;
        };
        return simulateInput;
    } else {
        const fileSystem = require('fs');
        const readFromFile = (promptText) => {
            if (promptText) {
                console.log(promptText);
            }
            const inputFilePath = '/dev/stdin';
            return fileSystem.readFileSync(inputFilePath, 'utf8');
        };
        return readFromFile;
    }
};

const acquireInput = createInputSource();
const rawInputLines = acquireInput().split('\n');

const parseAndSortNumericArray = (lineContent) => {
    const stringTokens = lineContent.split(' ');
    const numericValues = stringTokens.map(token => parseInt(token, 10));
    numericValues.sort((valA, valB) => valA - valB);
    return numericValues;
};

const [sizeLine, firstArrayLine, secondArrayLine] = rawInputLines;

const arraySize = parseInt(sizeLine, 10);
const firstArray = parseAndSortNumericArray(firstArrayLine);
const secondArray = parseAndSortNumericArray(secondArrayLine);

let hAccumulator = 0;
let kAccumulator = 0;

for (let idx = 0; idx < arraySize; idx++) {
    const currentFirstVal = firstArray[idx];
    const currentSecondVal = secondArray[idx];

    if (currentSecondVal < currentFirstVal) {
        const difference = currentFirstVal - currentSecondVal;
        hAccumulator += difference;
    } else if (currentSecondVal > currentFirstVal) {
        const difference = currentSecondVal - currentFirstVal;
        const halfDifference = Math.floor(difference / 2);
        kAccumulator += halfDifference;
    }
}

const resultCondition = kAccumulator >= hAccumulator;
console.log(resultCondition ? 'Yes' : 'No');
