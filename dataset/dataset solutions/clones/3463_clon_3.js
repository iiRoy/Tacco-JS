const parseInteger = val => parseInt(val, 10);
const parseIntegerArray = collection => collection.map(item => parseInteger(item));
const absoluteValue = num => num > 0 ? num : -num;

function findMinimum() {
    const args = arguments;
    let currentMin = args[0];
    for (let i = 1; i < args.length; i++) {
        if (args[i] < currentMin) {
            currentMin = args[i];
        }
    }
    return currentMin;
}

function findMaximum() {
    const args = arguments;
    let currentMax = args[0];
    for (let i = 1; i < args.length; i++) {
        if (args[i] > currentMax) {
            currentMax = args[i];
        }
    }
    return currentMax;
}

function greatestCommonDivisor() {
    const args = arguments;
    let currentGcd = args[0];
    const gcdRecursiveHelper = (a, b) => b ? gcdRecursiveHelper(b, a % b) : a;
    for (let i = 1; i < args.length; i++) {
        currentGcd = gcdRecursiveHelper(currentGcd, args[i]);
    }
    return currentGcd;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInputData(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const numElements = parseInteger(inputLines[0]);

    const sortedNumbers = inputLines.slice(1, numElements + 1).map(parseInteger);

    sortedNumbers.sort((a, b) => a - b);

    let calcX = 0;
    let calcY = 0;

    if (numElements % 2 === 0) {
        const halfCount = numElements / 2;
        const getMultiplierEven = (currentIdx) => (currentIdx >= halfCount) ? 2 : -2;

        for (let idx = 0; idx < numElements; idx++) {
            calcX += getMultiplierEven(idx) * sortedNumbers[idx];
        }
        const midEvenIdx = halfCount;
        const nextMidEvenIdx = halfCount + 1;
        calcX += sortedNumbers[midEvenIdx] - sortedNumbers[nextMidEvenIdx];
    } else {
        const midOddIdx = (numElements - 1) / 2;
        const getMultiplierOddX = (currentIdx) => (currentIdx >= midOddIdx) ? 2 : -2;
        const getMultiplierOddY = (currentIdx) => (currentIdx > midOddIdx) ? 2 : -2;

        for (let idx = 0; idx < numElements; idx++) {
            calcX += getMultiplierOddX(idx) * sortedNumbers[idx];
            calcY += getMultiplierOddY(idx) * sortedNumbers[idx];
        }
        const firstMidOddIdx = midOddIdx;
        const secondMidOddIdx = (numElements + 1) / 2;
        const thirdMidOddIdx = (numElements - 3) / 2;

        calcX -= (sortedNumbers[firstMidOddIdx] + sortedNumbers[secondMidOddIdx]);
        calcY += (sortedNumbers[firstMidOddIdx] + sortedNumbers[thirdMidOddIdx]);
    }

    const finalResult = findMaximum(calcX, calcY);

    console.log(finalResult);

    return 0;
}
