const acquireTargetValue = () => {
    const inputParameter = process.argv[2];
    return parseInt(inputParameter, 10);
};

const ascertainSearchLimit = (initialCandidate) => {
    const calculateFifthPowerDifference = (val) => Math.pow(val, 5) - Math.pow(val - 1, 5);
    const thresholdValue = Math.pow(10, 9);

    if (calculateFifthPowerDifference(initialCandidate) > thresholdValue) {
        return initialCandidate + 1;
    } else {
        return ascertainSearchLimit(initialCandidate + 1);
    }
};

function* generateNumericSequence(startPoint, endPointExclusive) {
    let currentPoint = startPoint;
    while (currentPoint < endPointExclusive) {
        yield currentPoint;
        currentPoint++;
    }
}

function* produceCoordinatePairs(boundaryValue) {
    const lowerBoundary = -boundaryValue;
    const upperBoundaryExclusive = boundaryValue;

    for (const primaryComponent of generateNumericSequence(lowerBoundary, upperBoundaryExclusive)) {
        for (const secondaryComponent of generateNumericSequence(lowerBoundary, upperBoundaryExclusive)) {
            yield [primaryComponent, secondaryComponent];
        }
    }
}

const initiateSolutionDiscovery = () => {
    const desiredDifference = acquireTargetValue();
    const maximumIterationRange = ascertainSearchLimit(10);

    for (const [firstElement, secondElement] of produceCoordinatePairs(maximumIterationRange)) {
        const firstElementPower = Math.pow(firstElement, 5);
        const secondElementPower = Math.pow(secondElement, 5);

        if (firstElementPower - secondElementPower === desiredDifference) {
            console.log(firstElement, secondElement);
            process.exit(0);
        }
    }
};

initiateSolutionDiscovery();
