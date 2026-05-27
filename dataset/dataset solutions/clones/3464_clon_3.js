const parseInteger = valStr => parseInt(valStr, 10);
const parseIntegerArray = inputArr => inputArr.map(valStr => parseInteger(valStr));
const absoluteValue = num => num > 0 ? num : -num;

function findMinimum(...inputValues) {
    return Math.min(...inputValues);
}

function findMaximum(...inputValues) {
    return Math.max(...inputValues);
}

function calculateGcdPair(a, b) {
    return b ? calculateGcdPair(b, a % b) : a;
}

function greatestCommonDivisor(...inputValues) {
    let currentGcd = inputValues[0];
    for (let idx = 1; idx < inputValues.length; idx++) {
        currentGcd = calculateGcdPair(currentGcd, inputValues[idx]);
    }
    return currentGcd;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInputData(rawData) {
    const lineData = rawData.split('\n');
    const elementCount = parseInteger(lineData[0]);

    const dataElements = lineData.slice(1, elementCount + 1).map(parseInteger);

    dataElements.sort((a, b) => a - b);

    let resultX = 0;
    let resultY = 0;

    const calculateWeightedSum = (value, condition) => condition ? 2 * value : -2 * value;

    if (elementCount % 2 === 0) {
        const halfCount = elementCount / 2;
        for (let idx = 0; idx < elementCount; idx++) {
            resultX += calculateWeightedSum(dataElements[idx], idx >= halfCount);
        }
        resultX += dataElements[halfCount - 1] - dataElements[halfCount];
    } else {
        const midIndex = (elementCount - 1) / 2;
        const nextMidIndex = (elementCount + 1) / 2;
        const prevMidIndex = (elementCount - 3) / 2;

        for (let idx = 0; idx < elementCount; idx++) {
            resultX += calculateWeightedSum(dataElements[idx], idx >= midIndex);
            resultY += calculateWeightedSum(dataElements[idx], idx > midIndex);
        }
        resultX -= dataElements[midIndex] + dataElements[nextMidIndex];
        resultY += dataElements[midIndex] + dataElements[prevMidIndex];
    }
    const finalAnswer = findMaximum(resultX, resultY);

    console.log(finalAnswer);

    return 0;
}
