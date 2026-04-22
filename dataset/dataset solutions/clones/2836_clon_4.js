const processDataPoints = (rawDataArray) => {
    const itemCount = +rawDataArray[0];
    const itemCollection = Array.from({ length: itemCount }, (_, index) => {
        const startIdx = 1 + index * 3;
        return {
            xValue: +rawDataArray[startIdx],
            yValue: +rawDataArray[startIdx + 1],
            directionIndicator: rawDataArray[startIdx + 2]
        };
    });
    return itemCollection;
};

const calculateXSpanAtMoment = (items, currentMoment) => {
    const xPositions = items.map(element => {
        switch (element.directionIndicator) {
            case 'L': return element.xValue - currentMoment;
            case 'R': return element.xValue + currentMoment;
            default: return element.xValue;
        }
    });
    if (xPositions.length === 0) {
        return { lowerBound: Infinity, upperBound: -Infinity };
    }
    return xPositions.reduce((accumulator, currentPosition) => ({
        lowerBound: Math.min(accumulator.lowerBound, currentPosition),
        upperBound: Math.max(accumulator.upperBound, currentPosition)
    }), { lowerBound: Infinity, upperBound: -Infinity });
};

const calculateYSpanAtMoment = (items, currentMoment) => {
    const yPositions = items.map(element => {
        switch (element.directionIndicator) {
            case 'U': return element.yValue + currentMoment;
            case 'D': return element.yValue - currentMoment;
            default: return element.yValue;
        }
    });
    if (yPositions.length === 0) {
        return { lowerBound: Infinity, upperBound: -Infinity };
    }
    return yPositions.reduce((accumulator, currentPosition) => ({
        lowerBound: Math.min(accumulator.lowerBound, currentPosition),
        upperBound: Math.max(accumulator.upperBound, currentPosition)
    }), { lowerBound: Infinity, upperBound: -Infinity });
};

const computeCoveringArea = (items, currentMoment) => {
    if (items.length === 0) return 0;

    const xExtremes = calculateXSpanAtMoment(items, currentMoment);
    const yExtremes = calculateYSpanAtMoment(items, currentMoment);

    const spanX = xExtremes.upperBound - xExtremes.lowerBound;
    const spanY = yExtremes.upperBound - yExtremes.lowerBound;

    return spanX * spanY;
};

const findMinimalCoverage = (incomingData) => {
    const parsedEntities = processDataPoints(incomingData);

    if (parsedEntities.length === 0) {
        return 0;
    }

    let initialTime = 0;
    let finalTime = 2 * 10**9 + 1000; // A sufficiently large time horizon

    // Employ ternary search to locate the time of minimal area
    while (finalTime - initialTime >= 3) {
        const midPoint1 = initialTime + Math.floor((finalTime - initialTime) / 3);
        const midPoint2 = finalTime - Math.floor((finalTime - initialTime) / 3);

        const areaAtMid1 = computeCoveringArea(parsedEntities, midPoint1);
        const areaAtMid2 = computeCoveringArea(parsedEntities, midPoint2);

        if (areaAtMid1 < areaAtMid2) {
            finalTime = midPoint2;
        } else {
            initialTime = midPoint1;
        }
    }

    // Explicitly check the remaining small interval of time values
    let smallestCoverage = Infinity;
    for (let tStep = initialTime; tStep <= finalTime; ++tStep) {
        smallestCoverage = Math.min(smallestCoverage, computeCoveringArea(parsedEntities, tStep));
    }

    return smallestCoverage;
};

function coordinateAnalyzer(externalInput) {
    const ultimateOutcome = findMinimalCoverage(externalInput);
    console.log(ultimateOutcome);
}