const parseInitialParameters = (firstLineString) => {
    const parts = firstLineString.split(" ");
    const baseRadix = 10;
    const numPoints = parseInt(parts[0], baseRadix);
    const numDimensions = parseInt(parts[1], baseRadix);
    return { numPoints, numDimensions };
};

const calculateEuclideanDistance = (point1Coords, point2Coords, dimensionsCount) => {
    const squaredDifferences = [];
    for (let dimIdx = 0; dimIdx < dimensionsCount; dimIdx++) {
        const coordinateDiff = point1Coords[dimIdx] - point2Coords[dimIdx];
        squaredDifferences[dimIdx] = coordinateDiff * coordinateDiff;
    }

    const sumOfSquaredDiffs = squaredDifferences.reduce((accumulator, currentSquare) => {
        return accumulator + currentSquare;
    }, 0);

    return Math.sqrt(sumOfSquaredDiffs);
};

const processInputData = (rawInputString) => {
    const inputLines = rawInputString.split("\n");

    const { numPoints, numDimensions } = parseInitialParameters(inputLines[0]);

    const pointCoordinates = [];
    for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
        pointCoordinates[pointIdx] = inputLines[pointIdx + 1].split(" ").map(Number);
    }

    let integerDistanceCount = 0;

    for (let pointIdxA = 0; pointIdxA < numPoints; pointIdxA++) {
        for (let pointIdxB = 0; pointIdxB < pointIdxA; pointIdxB++) {
            const currentDistance = calculateEuclideanDistance(
                pointCoordinates[pointIdxA],
                pointCoordinates[pointIdxB],
                numDimensions
            );

            if (Number.isInteger(currentDistance)) {
                integerDistanceCount++;
            }
        }
    }

    console.log(integerDistanceCount);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
