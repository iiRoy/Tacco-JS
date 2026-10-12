const parseStringArrayToNumbers = (stringArray) => {
    return stringArray.map(Number);
};

const determineSegmentCost = (currentPoint, nextPoint, ratePerUnit, ceilingCost) => {
    const distanceBetweenPoints = nextPoint - currentPoint;
    const directCost = ratePerUnit * distanceBetweenPoints;
    return Math.min(directCost, ceilingCost);
};

function processInput(rawData) {
    const inputLines = rawData.split('\n');

    const firstLineTokens = inputLines[0].split(' ');
    const [numPoints, unitCostFactor, segmentMaxCost] = parseStringArrayToNumbers(firstLineTokens);

    const pointCoordinates = parseStringArrayToNumbers(inputLines[1].split(' '));

    let accumulatedCost = 0;
    for (let currentSegmentIdx = 0; currentSegmentIdx < numPoints - 1; currentSegmentIdx++) {
        const startCoordinate = pointCoordinates[currentSegmentIdx];
        const endCoordinate = pointCoordinates[currentSegmentIdx + 1];
        accumulatedCost += determineSegmentCost(startCoordinate, endCoordinate, unitCostFactor, segmentMaxCost);
    }

    console.log(accumulatedCost);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
