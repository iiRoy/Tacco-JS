var parseInteger = val => parseInt(val, 10);
var parseIntegerArray = arr => arr.map(val => parseInteger(val));
var absoluteValue = val => val > 0 ? val : -val;

function findMinimum() {
    var values = arguments,
        currentMin = values[0];
    for (var i = 1; i < values.length; i++)
        if (values[i] < currentMin) currentMin = values[i];
    return currentMin
}

function findMaximum() {
    var values = arguments,
        currentMax = values[0];
    for (var i = 1; i < values.length; i++)
        if (values[i] > currentMax) currentMax = values[i];
    return currentMax
}

function greatestCommonDivisor() {
    var values = arguments,
        result = values[0],
        calculateGCD = (a, b) => b ? calculateGCD(b, a % b) : a;
    for (var i = 1; i < values.length; i++) result = calculateGCD(result, values[i]);
    return result
}

const parseLineToIntegerArray = (lineContent) => parseIntegerArray(lineContent.split(' '));

function findBestReplacementDigit(currentRemainingValue, candidates) {
    let bestReplacementIndex = -1;
    let smallestRemainder = Infinity;

    for (let i = 1; i < candidates.length; i++) {
        const currentCandidateCost = candidates[i][1];
        const currentRemainder = currentRemainingValue % currentCandidateCost;
        if (currentRemainder < smallestRemainder) {
            smallestRemainder = currentRemainder;
            bestReplacementIndex = i;
        }
    }
    return {
        bestIndex: bestReplacementIndex,
        minRemainder: smallestRemainder
    };
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInput(rawData) {
    const rawLines = rawData.split('\n');
    const parsedData = rawLines.map(parseLineToIntegerArray);

    let remainingValue = parsedData[0][0];
    const countAvailableDigits = parsedData[0][1];
    const availableDigitsSorted = parsedData[1].sort((a, b) => b - a);

    const digitCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];
    const possibleDigitCostPairs = [];
    const digitCostsSeen = new Set();

    for (const currentDigit of availableDigitsSorted) {
        const costOfDigit = digitCosts[currentDigit];
        if (!digitCostsSeen.has(costOfDigit)) {
            possibleDigitCostPairs.push([currentDigit, costOfDigit]);
            digitCostsSeen.add(costOfDigit);
        }
    }
    possibleDigitCostPairs.sort((pairA, pairB) => pairA[1] - pairB[1]);

    const intermediateResult = [];

    const firstCandidate = possibleDigitCostPairs[0];
    const firstDigit = firstCandidate[0];
    const firstCost = firstCandidate[1];

    intermediateResult[0] = [firstDigit, Math.floor(remainingValue / firstCost)];
    remainingValue %= firstCost;

    while (remainingValue !== 0) {
        remainingValue += firstCost;
        intermediateResult[0][1]--;

        const {
            bestIndex,
            minRemainder
        } = findBestReplacementDigit(remainingValue, possibleDigitCostPairs);

        if (minRemainder < Infinity) {
            const bestPair = possibleDigitCostPairs[bestIndex];
            const bestDigit = bestPair[0];
            const bestCost = bestPair[1];
            intermediateResult.push([bestDigit, Math.floor(remainingValue / bestCost)]);
            remainingValue = minRemainder;
        }
    }

    intermediateResult.sort((pairA, pairB) => pairB[0] - pairA[0]);

    let finalOutputString = '';
    for (const pair of intermediateResult) {
        const digitChar = String(pair[0]);
        const repeatCount = pair[1];
        finalOutputString += digitChar.repeat(repeatCount);
    }

    console.log(finalOutputString);
    return 0;
}
