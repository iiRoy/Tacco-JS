const calculateSquaredDistance = (pointA, pointB) => {
    return (pointA.xCoord - pointB.xCoord) ** 2 + (pointA.yCoord - pointB.yCoord) ** 2;
};

const checkPointInclusion = (queryPoint, circleDescription) => {
    const circleCenter = { xCoord: circleDescription.center_X, yCoord: circleDescription.center_Y };
    return calculateSquaredDistance(queryPoint, circleCenter) <= circleDescription.radius_squared;
};

function* produceCombinations(sourceElements, groupSize, currentAccumulation = [], startFromIndex = 0) {
    if (currentAccumulation.length === groupSize) {
        yield currentAccumulation;
        return;
    }
    for (let currentPosition = startFromIndex; currentPosition < sourceElements.length; currentPosition++) {
        yield* produceCombinations(
            sourceElements,
            groupSize,
            [...currentAccumulation, sourceElements[currentPosition]],
            currentPosition + 1
        );
    }
}

const determineCircleProperties = (firstPoint, secondPoint, thirdPoint) => {
    const sqDist_1_2 = calculateSquaredDistance(firstPoint, secondPoint);
    const sqDist_1_3 = calculateSquaredDistance(firstPoint, thirdPoint);
    const sqDist_2_3 = calculateSquaredDistance(secondPoint, thirdPoint);

    const distanceRecords = [
        { value: sqDist_1_2, p_One: firstPoint, p_Two: secondPoint },
        { value: sqDist_1_3, p_One: firstPoint, p_Two: thirdPoint },
        { value: sqDist_2_3, p_One: secondPoint, p_Two: thirdPoint }
    ];
    distanceRecords.sort((entryA, entryB) => entryB.value - entryA.value);

    const maximumSqDist = distanceRecords[0].value;
    const medianSqDist = distanceRecords[1].value;
const minimumSqDist = distanceRecords[2].value;

    let resultantGeometry = { center_X: 0, center_Y: 0, radius_squared: 0 };

    if (maximumSqDist > medianSqDist + minimumSqDist) {
        const definingEdgePair = distanceRecords[0];
        resultantGeometry.center_X = (definingEdgePair.p_One.xCoord + definingEdgePair.p_Two.xCoord) / 2;
        resultantGeometry.center_Y = (definingEdgePair.p_One.yCoord + definingEdgePair.p_Two.yCoord) / 2;
        resultantGeometry.radius_squared = calculateSquaredDistance(definingEdgePair.p_One, resultantGeometry);
    } else {
        const sqTerm_P1 = firstPoint.xCoord**2 + firstPoint.yCoord**2;
        const sqTerm_P2 = secondPoint.xCoord**2 + secondPoint.yCoord**2;
        const sqTerm_P3 = thirdPoint.xCoord**2 + thirdPoint.yCoord**2;

        const deltaX_P3_P1 = thirdPoint.xCoord - firstPoint.xCoord;
        const deltaY_P1_P2 = firstPoint.yCoord - secondPoint.yCoord;
        const deltaX_P2_P1 = secondPoint.xCoord - firstPoint.xCoord;
        const deltaY_P1_P3 = firstPoint.yCoord - thirdPoint.yCoord;

        const denominatorValue = 2 * (deltaX_P3_P1 * deltaY_P1_P2 - deltaX_P2_P1 * deltaY_P1_P3);

        resultantGeometry.center_Y = (deltaX_P3_P1 * (sqTerm_P1 - sqTerm_P2) - deltaX_P2_P1 * (sqTerm_P1 - sqTerm_P3)) / denominatorValue;

        if (firstPoint.xCoord !== secondPoint.xCoord) {
            resultantGeometry.center_X = ((2 * firstPoint.yCoord - 2 * secondPoint.yCoord) * resultantGeometry.center_Y - sqTerm_P1 + sqTerm_P2) / (2 * (secondPoint.xCoord - firstPoint.xCoord));
        } else {
            resultantGeometry.center_X = ((2 * firstPoint.yCoord - 2 * thirdPoint.yCoord) * resultantGeometry.center_Y - sqTerm_P1 + sqTerm_P3) / (2 * (thirdPoint.xCoord - firstPoint.xCoord));
        }
        resultantGeometry.radius_squared = calculateSquaredDistance(firstPoint, resultantGeometry);
    }
    return resultantGeometry;
};

const processInputAndSolve = (rawInputText) => {
    const linesOfData = rawInputText.split("\n");
    const totalPointCount = Number(linesOfData[0]);
    const pointStructures = linesOfData.slice(1, totalPointCount + 1).map(line => {
        const numericCoords = line.split(" ").map(Number);
        return { xCoord: numericCoords[0], yCoord: numericCoords[1] };
    });

    let solutionRadius = 0;

    for (const selectedPoints of produceCombinations(pointStructures, 3)) {
        const [pA, pB, pC] = selectedPoints;
        const candidateGeometry = determineCircleProperties(pA, pB, pC);

        const allPointsAreWithin = pointStructures.every(individualPoint =>
            checkPointInclusion(individualPoint, candidateGeometry)
        );

        if (allPointsAreWithin) {
            solutionRadius = Math.sqrt(candidateGeometry.radius_squared);
            break;
        }
    }

    console.log(solutionRadius);
    return solutionRadius;
};

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));