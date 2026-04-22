const processInput = (rawText) => {
    const parts = rawText.split(" ").map(Number);
    return {
        limit: parts[0],
        start: parts[1],
        mod: parts[2]
    };
};

const identifyPattern = (beginValue, modulusConstraint) => {
    let currentTerm = beginValue;
    const recordedTerms = [];
    const termPositions = new Map();

    let position = 0;
    let cycleInitiationPosition = -1;

    while (position <= modulusConstraint) { // A cycle must be found within M+1 steps
        if (termPositions.has(currentTerm)) {
            cycleInitiationPosition = termPositions.get(currentTerm);
            break;
        }
        termPositions.set(currentTerm, position);
        recordedTerms.push(currentTerm);
        currentTerm = (currentTerm * currentTerm) % modulusConstraint;
        position++;
    }

    const preLoopSegment = recordedTerms.slice(0, cycleInitiationPosition);
    const loopSegment = recordedTerms.slice(cycleInitiationPosition);

    return {
        initialSegment: preLoopSegment,
        cyclicSegment: loopSegment,
        initialLength: preLoopSegment.length,
        cyclicLength: loopSegment.length
    };
};

const aggregateSequenceValues = (paramObject) => {
    const { totalElements, initialSegment, cyclicSegment, initialLength, cyclicLength } = paramObject;

    let finalAccumulation = 0;

    const effectiveInitialLength = Math.min(totalElements, initialLength);
    finalAccumulation += initialSegment.slice(0, effectiveInitialLength).reduce((acc, val) => acc + val, 0);

    const remainingElementsAfterPrefix = totalElements - initialLength;

    if (remainingElementsAfterPrefix > 0 && cyclicLength > 0) {
        const singleCycleSum = cyclicSegment.reduce((acc, val) => acc + val, 0);
        
        const fullCycleOccurrences = Math.floor(remainingElementsAfterPrefix / cyclicLength);
        finalAccumulation += singleCycleSum * fullCycleOccurrences;

        const partialCycleRemainder = remainingElementsAfterPrefix % cyclicLength;
        finalAccumulation += cyclicSegment.slice(0, partialCycleRemainder).reduce((acc, val) => acc + val, 0);
    }
    
    return finalAccumulation;
};

const runCalculation = (inputData) => {
    const { limit, start, mod } = processInput(inputData);
    const patternDetails = identifyPattern(start, mod);

    const fullCalculationParams = {
        totalElements: limit,
        initialSegment: patternDetails.initialSegment,
        cyclicSegment: patternDetails.cyclicSegment,
        initialLength: patternDetails.initialLength,
        cyclicLength: patternDetails.cyclicLength
    };

    const overallSum = aggregateSequenceValues(fullCalculationParams);
    console.log(overallSum);
};

runCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));