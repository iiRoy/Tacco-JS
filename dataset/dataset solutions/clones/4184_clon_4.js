const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER;
const mod = 1000000007;

const computeArraySum = (dataCollection) => dataCollection.reduce((total, currentVal) => total + Number(currentVal), 0);

const logIfDebug = (messageContent) => debugMode && console.log(messageContent);

const findMaxElementIndex = (valueArray) => {
    if (valueArray.length === 0) return -1;
    return valueArray.reduce((maxIdx, currentVal, idx, arr) => (currentVal > arr[maxIdx] ? idx : maxIdx), 0);
};

const findMinElementIndex = (valueArray) => {
    if (valueArray.length === 0) return -1;
    return valueArray.reduce((minIdx, currentVal, idx, arr) => (currentVal < arr[minIdx] ? idx : minIdx), 0);
};

const transform1dTo2d = (inputArray) => {
    inputArray.forEach((item, index, arr) => {
        arr[index] = item.split('');
    });
    return inputArray;
};

const checkPrimality = (candidateNumber) => {
    if (!Number.isInteger(candidateNumber) || candidateNumber <= 1) return false;
    if (candidateNumber === 2) return true;
    if (candidateNumber % 2 === 0) return false;

    let divisor = 3;
    const limit = Math.floor(Math.sqrt(candidateNumber));
    while (divisor <= limit) {
        if (candidateNumber % divisor === 0) return false;
        divisor += 2;
    }
    return true;
};

const validateNumericString = (inputString) => /^(?:[1-9]\d*|0)$/.test(inputString);

const calculateFactorial = (value) => {
    if (value < 0) return NaN;
    let product = 1;
    for (let k = 2; k <= value; k++) {
        product *= k;
    }
    return product;
};

const rotateMatrixClockwise = (sourceMatrix) => {
    const originalRows = sourceMatrix.length;
    const originalCols = sourceMatrix[0].length;

    return Array.from({ length: originalCols }, (_, colIdx) =>
        Array.from({ length: originalRows }, (_, rowIdx) =>
            sourceMatrix[originalRows - 1 - rowIdx][colIdx]
        )
    );
};

const insertPartialArray = (baseArray, elementsToInsert, startIndex) => {
    baseArray.splice(startIndex, elementsToInsert.length, ...elementsToInsert);
    return baseArray;
};

const reverseSubarraySegment = (targetArray, startOneBased, endOneBased) => {
    const actualStart = startOneBased - 1;
    const actualEnd = endOneBased;

    const segment = targetArray.slice(actualStart, actualEnd);
    segment.reverse();

    targetArray.splice(actualStart, segment.length, ...segment);
    return targetArray;
};

const padNumberWithZeros = (value, desiredLength) => String(value).padStart(desiredLength, '0');

const factorizeNumber = (inputVal) => {
    if (inputVal === 1) return { "1": 1 };
    const primeFactors = new Map();
    let currentNum = inputVal;

    for (let factorCandidate = 2; factorCandidate * factorCandidate <= currentNum; factorCandidate++) {
        while (currentNum % factorCandidate === 0) {
            primeFactors.set(factorCandidate, (primeFactors.get(factorCandidate) || 0) + 1);
            currentNum /= factorCandidate;
        }
    }
    if (currentNum > 1) {
        primeFactors.set(currentNum, (primeFactors.get(currentNum) || 0) + 1);
    }
    return Object.fromEntries(primeFactors);
};

const greatestCommonDivisor = (valA, valB) => {
    let x = Math.abs(valA);
    let y = Math.abs(valB);
    while (y) {
        [x, y] = [y, x % y];
    }
    return x;
};

const leastCommonMultiple = (valA, valB) => {
    if (valA === 0 || valB === 0) return 0;
    return Math.abs(valA * valB) / greatestCommonDivisor(valA, valB);
};

const numericComparator = (first, second) => first - second;

const locateOrInsertIndex = (sortedArray, targetValue) => {
    let lowerBound = 0;
    let upperBound = sortedArray.length - 1;
    let foundIndex = -1;

    while (lowerBound <= upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (sortedArray[midPoint] === targetValue) {
            foundIndex = midPoint;
            break;
        } else if (sortedArray[midPoint] < targetValue) {
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint - 1;
        }
    }
    return foundIndex !== -1 ? foundIndex : lowerBound;
};

const splitByNewline = (textInput) => textInput.split('\n');

const isSortedAscending = (dataSequence) =>
    dataSequence.every((element, index, array) => index === 0 || element >= array[index - 1]);

const decomposeIntoPrimeFactors = (targetNumber) => {
    const factorsMap = new Map();
    let currentDivisor = 2;
    let remainingNumber = targetNumber;

    while (remainingNumber > 1) {
        if (remainingNumber % currentDivisor === 0) {
            factorsMap.set(currentDivisor, (factorsMap.get(currentDivisor) || 0) + 1);
            remainingNumber /= currentDivisor;
        } else {
            currentDivisor++;
            if (currentDivisor * currentDivisor > remainingNumber && remainingNumber > 1) {
                factorsMap.set(remainingNumber, (factorsMap.get(remainingNumber) || 0) + 1);
                remainingNumber = 1;
            }
        }
    }
    return Object.fromEntries(factorsMap);
};

function calculateMinimumEliminationCost(inputString) {
    const [configLine, dataLine] = inputString.split('\n');
    const targetUniqueCount = parseInt(configLine.split(' ')[1], 10);
    const rawDataItems = dataLine.split(' ');

    const itemOccurrences = rawDataItems.reduce((accumulator, currentItem) => {
        accumulator.set(currentItem, (accumulator.get(currentItem) || 0) + 1);
        return accumulator;
    }, new Map());

    const frequencyValues = Array.from(itemOccurrences.values()).sort((valA, valB) => valA - valB);

    const distinctItemCount = frequencyValues.length;

    if (distinctItemCount <= targetUniqueCount) {
        console.log(0);
    } else {
        const itemsToEliminate = distinctItemCount - targetUniqueCount;
        const costToEliminate = frequencyValues
            .slice(0, itemsToEliminate)
            .reduce((totalCost, currentFreq) => totalCost + currentFreq, 0);
        console.log(costToEliminate);
    }
}

calculateMinimumEliminationCost(require("fs").readFileSync("/dev/stdin", "utf8").trim());
