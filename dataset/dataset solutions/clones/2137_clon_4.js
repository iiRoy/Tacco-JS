function calculateSumOfSquaresDifference(pointsCollection, targetPoint) {
    return pointsCollection.reduce((accumulatedSum, currentPointValue) => {
        const deviation = currentPointValue - targetPoint;
        return accumulatedSum + (deviation * deviation);
    }, 0);
}

function Main(sourceData) {
    const dataLines = sourceData.split("\n");

    const firstLineElements = dataLines[0].split(" ").map(Number);
    const totalPointsCount = firstLineElements[0];

    const numericPoints = dataLines[1].split(" ").map(Number);

    const sumOfAllPoints = numericPoints.reduce((currentSum, point) => currentSum + point, 0);
    const calculatedAverage = sumOfAllPoints / totalPointsCount;

    const lowerBoundTarget = Math.floor(calculatedAverage);
    const upperBoundTarget = Math.ceil(calculatedAverage);

    let overallMinimumCost = Infinity;

    const costForLowerBound = calculateSumOfSquaresDifference(numericPoints, lowerBoundTarget);
    overallMinimumCost = Math.min(overallMinimumCost, costForLowerBound);

    if (lowerBoundTarget !== upperBoundTarget) {
        const costForUpperBound = calculateSumOfSquaresDifference(numericPoints, upperBoundTarget);
        overallMinimumCost = Math.min(overallMinimumCost, costForUpperBound);
    }

    console.log(overallMinimumCost);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
