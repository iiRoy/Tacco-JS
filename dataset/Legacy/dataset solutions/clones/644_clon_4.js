const fileSystem = require('fs');

const createInputReader = () => {
    const fullInputContent = fileSystem.readFileSync('/dev/stdin', 'utf-8');
    const inputLines = fullInputContent.split('\n');
    let currentLineIndex = 0;

    const retrieveNextLine = () => {
        if (currentLineIndex >= inputLines.length) {
            return undefined;
        }
        return inputLines[currentLineIndex++];
    };

    const retrieveRemainingLines = () => {
        const remaining = inputLines.slice(currentLineIndex);
        currentLineIndex = inputLines.length;
        return remaining;
    };

    return {
        fetchLine: retrieveNextLine,
        fetchRemaining: retrieveRemainingLines
    };
};

const inputSource = createInputReader();

const parseNumericArray = (arr) => arr.map(Number);
const convertToStringArray = (arr) => arr.map(String);

const generateNumericSequence = (count, generatorCallback = (idx) => idx) => {
    return Array.from({ length: count }, (_, idx) => generatorCallback(idx));
};

const calculateArraySum = (dataArray, valueExtractor = (val) => val) => {
    if (dataArray.length === 0) return undefined;
    return dataArray.reduce((accumulator, currentElement, index) => accumulator + valueExtractor(currentElement, index), 0);
};

const findArrayMaximum = (dataArray, valueExtractor = (val) => val) => {
    if (dataArray.length === 0) return undefined;
    let maximumValue = valueExtractor(dataArray[0], 0);
    for (let i = 1; i < dataArray.length; ++i) {
        const currentTransformed = valueExtractor(dataArray[i], i);
        if (currentTransformed > maximumValue) {
            maximumValue = currentTransformed;
        }
    }
    return maximumValue;
};

const findArrayMinimum = (dataArray, valueExtractor = (val) => val) => {
    if (dataArray.length === 0) return undefined;
    let minimumValue = valueExtractor(dataArray[0], 0);
    for (let i = 1; i < dataArray.length; ++i) {
        const currentTransformed = valueExtractor(dataArray[i], i);
        if (currentTransformed < minimumValue) {
            minimumValue = currentTransformed;
        }
    }
    return minimumValue;
};


const firstLineParts = inputSource.fetchLine().split(' ');
const [rowsCount, columnsCount] = parseNumericArray(firstLineParts);

const stringMatrix = generateNumericSequence(rowsCount, () => inputSource.fetchLine());

const costCache = new Map();

const determineLineCost = (lineIndex, targetColor) => {
    if (!costCache.has(lineIndex)) {
        costCache.set(lineIndex, new Map());
    }
    const lineCache = costCache.get(lineIndex);

    if (lineCache.has(targetColor)) {
        return lineCache.get(targetColor);
    }

    const occurrences = stringMatrix[lineIndex].split(targetColor).length - 1;
    const calculatedCost = columnsCount - occurrences;

    lineCache.set(targetColor, calculatedCost);
    return calculatedCost;
};

const allCostsW = generateNumericSequence(rowsCount, (idx) => determineLineCost(idx, 'W'));
const allCostsB = generateNumericSequence(rowsCount, (idx) => determineLineCost(idx, 'B'));
const allCostsR = generateNumericSequence(rowsCount, (idx) => determineLineCost(idx, 'R'));

const computePrefixSums = (costsArray) => {
    const sums = new Array(costsArray.length + 1).fill(0);
    for (let i = 0; i < costsArray.length; ++i) {
        sums[i + 1] = sums[i] + costsArray[i];
    }
    return sums;
};

const prefixSumsW = computePrefixSums(allCostsW);
const prefixSumsB = computePrefixSums(allCostsB);
const prefixSumsR = computePrefixSums(allCostsR);

let minimumTotalCost = rowsCount * columnsCount;

for (let i = 0; i < rowsCount - 2; ++i) {
    const currentCostW = prefixSumsW[i + 1];

    for (let j = i + 1; j < rowsCount - 1; ++j) {
        const currentCostB = prefixSumsB[j + 1] - prefixSumsB[i + 1];

        const currentCostR = prefixSumsR[rowsCount] - prefixSumsR[j + 1];

        const combinedCost = currentCostW + currentCostB + currentCostR;
        if (combinedCost < minimumTotalCost) {
            minimumTotalCost = combinedCost;
        }
    }
}

console.log(minimumTotalCost);
