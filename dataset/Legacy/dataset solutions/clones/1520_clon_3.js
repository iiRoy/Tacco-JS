function getRemainder(value, base) {
    return value % base;
}

function parseInputData(rawInputString) {
    const lines = rawInputString.trim().split("\n");
    const [nVal, xVal, mVal] = lines[0].split(" ").map(Number);
    return {
        totalIterations: nVal,
        initialTerm: xVal,
        modulusBase: mVal
    };
}

function computeCycleSum(visitedTracker, modulus, cycleStartIteration) {
    let sumOfCycleElements = 0;
    for (let idx = 0; idx < modulus; idx++) {
        if (visitedTracker[idx] >= cycleStartIteration) {
            sumOfCycleElements += idx;
        }
    }
    return sumOfCycleElements;
}

function processSequence(inputDataString) {
    const { totalIterations, initialTerm, modulusBase } = parseInputData(inputDataString);

    const visitedTracker = new Array(modulusBase).fill(0);
    let currentTerm = initialTerm;
    let finalAccumulatedSum = 0;
    let remainingIterations = totalIterations;

    visitedTracker[currentTerm] = 1;

    for (let currentIteration = 2; currentIteration <= remainingIterations; currentIteration++) {
        const previousTerm = currentTerm;
        const squaredPreviousTerm = previousTerm * previousTerm;
        currentTerm = getRemainder(squaredPreviousTerm, modulusBase);

        const firstVisitIteration = visitedTracker[currentTerm];

        if (firstVisitIteration === 0) {
            visitedTracker[currentTerm] = currentIteration;
        } else {
            const cycleLength = currentIteration - firstVisitIteration;

            const currentCycleSum = computeCycleSum(visitedTracker, modulusBase, firstVisitIteration);

            const stepsRemainingFromCycleStart = remainingIterations - firstVisitIteration + 1;
            const fullCycleCount = Math.floor(stepsRemainingFromCycleStart / cycleLength);
            finalAccumulatedSum += fullCycleCount * currentCycleSum;

            const partialCycleSteps = getRemainder(stepsRemainingFromCycleStart, cycleLength);
            remainingIterations = firstVisitIteration - 1 + partialCycleSteps;

            break;
        }
    }

    for (let termValue = 0; termValue < modulusBase; termValue++) {
        if (visitedTracker[termValue] > 0 && visitedTracker[termValue] <= remainingIterations) {
            finalAccumulatedSum += termValue;
        }
    }

    console.log(finalAccumulatedSum);
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
