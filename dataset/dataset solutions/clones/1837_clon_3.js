let transformationCostCache = new Map();

function getOptimalTransformationCost(currentNumber, costDiv2, costDiv3, costDiv5, costAdj) {
    if (currentNumber < 1) {
        return Infinity;
    }

    if (currentNumber === 1) {
        return 0;
    }

    if (transformationCostCache.has(currentNumber)) {
        return transformationCostCache.get(currentNumber);
    }

    let minCostForCurrentState = Infinity;

    if (currentNumber % 2 === 0) {
        const costViaDiv2 = getOptimalTransformationCost(currentNumber / 2, costDiv2, costDiv3, costDiv5, costAdj) + costDiv2;
        minCostForCurrentState = Math.min(minCostForCurrentState, costViaDiv2);
    }

    if (currentNumber % 3 === 0) {
        const costViaDiv3 = getOptimalTransformationCost(currentNumber / 3, costDiv2, costDiv3, costDiv5, costAdj) + costDiv3;
        minCostForCurrentState = Math.min(minCostForCurrentState, costViaDiv3);
    }

    if (currentNumber % 5 === 0) {
        const costViaDiv5 = getOptimalTransformationCost(currentNumber / 5, costDiv2, costDiv3, costDiv5, costAdj) + costDiv5;
        minCostForCurrentState = Math.min(minCostForCurrentState, costViaDiv5);
    }

    const costViaDecrement = getOptimalTransformationCost(currentNumber - 1, costDiv2, costDiv3, costDiv5, costAdj) + costAdj;
    minCostForCurrentState = Math.min(minCostForCurrentState, costViaDecrement);

    const costViaIncrement = getOptimalTransformationCost(currentNumber + 1, costDiv2, costDiv3, costDiv5, costAdj) + costAdj;
    minCostForCurrentState = Math.min(minCostForCurrentState, costViaIncrement);

    transformationCostCache.set(currentNumber, minCostForCurrentState);
    return minCostForCurrentState;
}

function processInputData(rawDataString) {
    transformationCostCache.clear();

    let parsedLines = rawDataString.trim().split('\n');

    const numberOfDefinitions = Number(parsedLines[0].split(' ')[0]);

    let taskSpecifications = [];

    for (let currentLineIdx = 1; currentLineIdx <= numberOfDefinitions && currentLineIdx < parsedLines.length; currentLineIdx++) {
        const currentSpec = parsedLines[currentLineIdx].split(' ').map(Number);
        taskSpecifications.push(currentSpec);
    }

    let computedCosts = [];

    for (let specIndex = 0; specIndex < taskSpecifications.length; specIndex++) {
        const currentSpecDetails = taskSpecifications[specIndex];

        const initialValue = currentSpecDetails[0];
        const costFactorTwo = currentSpecDetails[1];
        const costFactorThree = currentSpecDetails[2];
        const costFactorFive = currentSpecDetails[3];
        const costAdjacent = currentSpecDetails[4];

        const resultCost = getOptimalTransformationCost(initialValue, costFactorTwo, costFactorThree, costFactorFive, costAdjacent);

        computedCosts.push(resultCost);

        console.log(resultCost);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));