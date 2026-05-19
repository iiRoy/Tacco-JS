const NUM_DIGITS = 10;
const INITIAL_MAX_COST = 10000;
const TARGET_DIGIT = 1;

function parseGridDimensions(dimensionLine) {
    const parts = dimensionLine.split(" ");
    const height = parseInt(parts[0], 10);
    const width = parseInt(parts[1], 10);
    return { height, width };
}

function parseConversionCosts(inputLines, startLineIndex) {
    const costs = [];
    for (let row = 0; row < NUM_DIGITS; row++) {
        const costRowString = inputLines[startLineIndex + row].split(" ");
        costs.push(costRowString.map(Number));
    }
    return costs;
}

function calculateDigitFrequencies(inputLines, gridHeight, gridWidth, startLineIndex) {
    const frequencies = new Array(NUM_DIGITS).fill(0);
    for (let row = 0; row < gridHeight; row++) {
        const gridRowString = inputLines[startLineIndex + row].split(" ");
        for (let col = 0; col < gridWidth; col++) {
            const digit = parseInt(gridRowString[col], 10);
            if (digit >= 0 && digit < NUM_DIGITS) {
                frequencies[digit]++;
            }
        }
    }
    return frequencies;
}

function findMinCostPath(startNode, endNode, costsMatrix) {
    const currentDistances = Array.from({ length: NUM_DIGITS }, (_, k) => [k, INITIAL_MAX_COST]);
    currentDistances[startNode][1] = 0;

    const unvisitedNodes = Array.from({ length: NUM_DIGITS }, (_, k) => k);

    let currentNode = startNode;

    while (unvisitedNodes.length > 0) {
        let nextNodeCandidate = -1;
        let minCostForNextSelection = INITIAL_MAX_COST;

        for (let k = 0; k < unvisitedNodes.length; k++) {
            const neighborNode = unvisitedNodes[k];

            const pathThroughCurrent = currentDistances[currentNode][1] + costsMatrix[currentNode][neighborNode];
            if (pathThroughCurrent < currentDistances[neighborNode][1]) {
                currentDistances[neighborNode][1] = pathThroughCurrent;
            }

            if (currentDistances[neighborNode][1] < minCostForNextSelection && currentDistances[neighborNode][1] !== 0) {
                minCostForNextSelection = currentDistances[neighborNode][1];
                nextNodeCandidate = neighborNode;
            }
        }

        const currentIdxInUnvisited = unvisitedNodes.indexOf(currentNode);
        if (currentIdxInUnvisited > -1) {
            unvisitedNodes.splice(currentIdxInUnvisited, 1);
        }

        currentNode = nextNodeCandidate;
    }

    return currentDistances[endNode][1];
}

function processInputData(rawInputLines) {
    rawInputLines = rawInputLines.split("\n");

    const { height: gridHeight, width: gridWidth } = parseGridDimensions(rawInputLines[0]);

    const conversionCosts = parseConversionCosts(rawInputLines, 1);

    const digitFrequencies = calculateDigitFrequencies(rawInputLines, gridHeight, gridWidth, 11);

    let totalMinimumConversionCost = 0;

    for (let sourceDigit = 0; sourceDigit < NUM_DIGITS; sourceDigit++) {
        if (digitFrequencies[sourceDigit] === 0 || sourceDigit === TARGET_DIGIT) {
            continue;
        }

        const costToConvertSourceToTarget = findMinCostPath(sourceDigit, TARGET_DIGIT, conversionCosts);

        totalMinimumConversionCost += costToConvertSourceToTarget * digitFrequencies[sourceDigit];
    }

    console.log('%s', totalMinimumConversionCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
