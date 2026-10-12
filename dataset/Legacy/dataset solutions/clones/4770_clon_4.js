const processJourneyData = (sourceText) => {
    const [firstConfigLine, pathCoordsLine] = sourceText.split('\n');

    const [numPoints, costPerUnit, maxSegmentCap] = firstConfigLine.split(' ').map(Number);
    const coordinateValues = pathCoordsLine.split(' ').map(Number);

    const totalAccumulatedCost = coordinateValues.slice(1).reduce((currentTotal, currentCoordValue, segmentIdx) => {
        const previousCoordValue = coordinateValues[segmentIdx];
        const segmentDistance = currentCoordValue - previousCoordValue;
        const segmentCost = Math.min(costPerUnit * segmentDistance, maxSegmentCap);
        return currentTotal + segmentCost;
    }, 0);

    console.log(totalAccumulatedCost);
};

processJourneyData(require("fs").readFileSync("/dev/stdin", "utf8"));
