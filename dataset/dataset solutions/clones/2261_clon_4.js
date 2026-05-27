function calculateSquaredDistance(pointOne, pointTwo) {
    const deltaX = pointOne.x - pointTwo.x;
    const deltaY = pointOne.y - pointTwo.y;
    return deltaX * deltaX + deltaY * deltaY;
}

function findMidpoint(pointOne, pointTwo) {
    return {
        x: (pointOne.x + pointTwo.x) / 2,
        y: (pointOne.y + pointTwo.y) / 2
    };
}

function determineCircle(firstPoint, secondPoint, thirdPoint) {
    const sqDistAB = calculateSquaredDistance(firstPoint, secondPoint);
    const sqDistAC = calculateSquaredDistance(firstPoint, thirdPoint);
    const sqDistBC = calculateSquaredDistance(secondPoint, thirdPoint);

    let circleX, circleY, circleRadiusSq;

    if (sqDistAB >= sqDistAC + sqDistBC) {
        const mid = findMidpoint(firstPoint, secondPoint);
        circleX = mid.x;
        circleY = mid.y;
        circleRadiusSq = sqDistAB / 4;
    } else if (sqDistAC >= sqDistAB + sqDistBC) {
        const mid = findMidpoint(firstPoint, thirdPoint);
        circleX = mid.x;
        circleY = mid.y;
        circleRadiusSq = sqDistAC / 4;
    } else if (sqDistBC >= sqDistAB + sqDistAC) {
        const mid = findMidpoint(secondPoint, thirdPoint);
        circleX = mid.x;
        circleY = mid.y;
        circleRadiusSq = sqDistBC / 4;
    } else {
        const determinant = 2 * (firstPoint.x * (secondPoint.y - thirdPoint.y) + secondPoint.x * (thirdPoint.y - firstPoint.y) + thirdPoint.x * (firstPoint.y - secondPoint.y));

        if (Math.abs(determinant) < 1e-9) {
            return null;
        }

        const firstMagSq = firstPoint.x * firstPoint.x + firstPoint.y * firstPoint.y;
        const secondMagSq = secondPoint.x * secondPoint.x + secondPoint.y * secondPoint.y;
        const thirdMagSq = thirdPoint.x * thirdPoint.x + thirdPoint.y * thirdPoint.y;

        circleX = (firstMagSq * (secondPoint.y - thirdPoint.y) + secondMagSq * (thirdPoint.y - firstPoint.y) + thirdMagSq * (firstPoint.y - secondPoint.y)) / determinant;
        circleY = (firstMagSq * (thirdPoint.x - secondPoint.x) + secondMagSq * (firstPoint.x - thirdPoint.x) + thirdMagSq * (secondPoint.x - firstPoint.x)) / determinant;
        circleRadiusSq = calculateSquaredDistance(firstPoint, { x: circleX, y: circleY });
    }

    return { centerX: circleX, centerY: circleY, radiusSq: circleRadiusSq };
}

function* generateCombinations(elements, selectionSize) {
    const totalElements = elements.length;
    if (selectionSize > totalElements || selectionSize < 0) return;
    if (selectionSize === 0) {
        yield [];
        return;
    }
    if (selectionSize === totalElements) {
        yield elements;
        return;
    }

    function* recurse(startIndex, currentCombination) {
        if (currentCombination.length === selectionSize) {
            yield currentCombination;
            return;
        }
        for (let i = startIndex; i < totalElements; i++) {
            yield* recurse(i + 1, [...currentCombination, elements[i]]);
        }
    }
    yield* recurse(0, []);
}

function processCoordinates(rawData) {
    const dataLines = rawData.split("\n");
    const numPoints = parseInt(dataLines[0]);

    const allCoordinatePoints = dataLines.slice(1, numPoints + 1).map(line => {
        const parts = line.split(" ").map(Number);
        return { x: parts[0], y: parts[1] };
    });

    let finalResultRadius = 0;
    const comparisonEpsilon = 1e-9;

    const pointIndices = Array.from({ length: numPoints }, (_, i) => i);

    for (const indices of generateCombinations(pointIndices, 3)) {
        const p1 = allCoordinatePoints[indices[0]];
        const p2 = allCoordinatePoints[indices[1]];
        const p3 = allCoordinatePoints[indices[2]];

        const candidateCircleData = determineCircle(p1, p2, p3);

        if (candidateCircleData) {
            const { centerX, centerY, radiusSq } = candidateCircleData;

            const allContained = allCoordinatePoints.every(currentPoint => {
                return calculateSquaredDistance(currentPoint, { x: centerX, y: centerY }) <= radiusSq + comparisonEpsilon;
            });

            if (allContained) {
                finalResultRadius = Math.sqrt(radiusSq);
                break;
            }
        }
    }

    console.log('%s', finalResultRadius);
    return finalResultRadius;
}

function testCoordinateSet(testIdentifier) {
    const testInputContent = document.getElementById("input" + testIdentifier).value;
    const calculatedOutcome = processCoordinates(testInputContent);
    const expectedOutcomeText = document.getElementById("output" + testIdentifier).value.split("\n")[0];
    let evaluationStatus = "WA";
    if (calculatedOutcome.toString() === expectedOutcomeText) {
        evaluationStatus = "AC";
    }
    document.getElementById("result" + testIdentifier).innerHTML = evaluationStatus;
}

processCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));
