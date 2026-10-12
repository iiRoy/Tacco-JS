const getSquaredDistance = (pointOne, pointTwo) => {
    const deltaX = pointOne[0] - pointTwo[0];
    const deltaY = pointOne[1] - pointTwo[1];
    return deltaX * deltaX + deltaY * deltaY;
};

const calculateCircumcircleProperties = (pointA, pointB, pointC) => {
    const sqDistAB = getSquaredDistance(pointA, pointB);
    const sqDistAC = getSquaredDistance(pointA, pointC);
    const sqDistBC = getSquaredDistance(pointC, pointB);

    const edgeSquaredLengths = [
        { value: sqDistAB, index: 0 }, // Edge AB
        { value: sqDistAC, index: 1 }, // Edge AC
        { value: sqDistBC, index: 2 }  // Edge BC
    ];

    edgeSquaredLengths.sort((e1, e2) => e2.value - e1.value);

    let circleCenterX, circleCenterY, circleRadiusSquared;

    // Check if the triangle is obtuse or right-angled (longest side is diameter)
    if (edgeSquaredLengths[0].value > edgeSquaredLengths[1].value + edgeSquaredLengths[2].value) {
        const longestEdgeIndex = edgeSquaredLengths[0].index;
        let pStart, pEnd;

        if (longestEdgeIndex === 0) { // AB is longest
            pStart = pointA; pEnd = pointB;
        } else if (longestEdgeIndex === 1) { // AC is longest
            pStart = pointA; pEnd = pointC;
        } else { // BC is longest
            pStart = pointB; pEnd = pointC;
        }

        circleCenterX = (pStart[0] + pEnd[0]) / 2;
        circleCenterY = (pStart[1] + pEnd[1]) / 2;
        circleRadiusSquared = getSquaredDistance(pStart, [circleCenterX, circleCenterY]);

    } else {
        // Acute triangle, calculate circumcenter using general formula
        const termA = pointA[0] * pointA[0] + pointA[1] * pointA[1];
        const termB = pointB[0] * pointB[0] + pointB[1] * pointB[1];
        const termC = pointC[0] * pointC[0] + pointC[1] * pointC[1];

        const numeratorY = (pointC[0] - pointA[0]) * (termA - termB) - (pointB[0] - pointA[0]) * (termA - termC);
        const denominator = 2 * ((pointC[0] - pointA[0]) * (pointA[1] - pointB[1]) - (pointB[0] - pointA[0]) * (pointA[1] - pointC[1]));

        circleCenterY = numeratorY / denominator;

        if (pointA[0] !== pointB[0]) {
            circleCenterX = (2 * (pointA[1] - pointB[1]) * circleCenterY - termA + termB) / (2 * (pointB[0] - pointA[0]));
        } else { // pointA[0] === pointB[0], use pointC
            circleCenterX = (2 * (pointA[1] - pointC[1]) * circleCenterY - termA + termC) / (2 * (pointC[0] - pointA[0]));
        }
        circleRadiusSquared = getSquaredDistance(pointA, [circleCenterX, circleCenterY]);
    }

    return { centerX: circleCenterX, centerY: circleCenterY, radiusSquared: circleRadiusSquared };
};

const ENCLOSURE_TOLERANCE = 0.000001;

const checkAllPointsEnclosed = (allPoints, currentCenterX, currentCenterY, currentRadiusSquared) => {
    for (let pointIndex = 0; pointIndex < allPoints.length; pointIndex++) {
        const currentPoint = allPoints[pointIndex];
        const distanceSqToCenter = getSquaredDistance(currentPoint, [currentCenterX, currentCenterY]);
        if (distanceSqToCenter > currentRadiusSquared + ENCLOSURE_TOLERANCE) {
            return false;
        }
    }
    return true;
};

function processInputData(rawInputString) {
    let inputLines = rawInputString.split("\n");
    const totalPointCount = parseInt(inputLines[0], 10);
    inputLines.shift();

    const allPointsCoordinates = inputLines.slice(0, totalPointCount).map(line =>
        line.split(" ").map(coordStr => parseInt(coordStr, 10))
    );

    let finalEnclosingRadius = 0; // Initialize to 0 to match original code's behavior for N=2

    if (totalPointCount === 2) {
        // The original code calculates the radius for N=2 but due to a `var` scoping bug,
        // it effectively returns 0. We replicate this exact behavior.
        // const p1 = allPointsCoordinates[0];
        // const p2 = allPointsCoordinates[1];
        // finalEnclosingRadius = Math.sqrt(getSquaredDistance(p1, p2)) / 2; // This would be the correct calculation
    } else {
        let candidateRadiusForN_gt_2 = Infinity; // Use a temporary variable for actual calculation

        for (let idxA = 0; idxA < totalPointCount; idxA++) {
            for (let idxB = idxA + 1; idxB < totalPointCount; idxB++) {
                for (let idxC = idxB + 1; idxC < totalPointCount; idxC++) {
                    const pA = allPointsCoordinates[idxA];
                    const pB = allPointsCoordinates[idxB];
                    const pC = allPointsCoordinates[idxC];

                    const { centerX, centerY, radiusSquared } = calculateCircumcircleProperties(pA, pB, pC);

                    if (checkAllPointsEnclosed(allPointsCoordinates, centerX, centerY, radiusSquared)) {
                        candidateRadiusForN_gt_2 = Math.sqrt(radiusSquared);
                        // Original code breaks all loops once a valid circle is found.
                        break;
                    }
                }
                if (candidateRadiusForN_gt_2 !== Infinity) {
                    break;
                }
            }
            if (candidateRadiusForN_gt_2 !== Infinity) {
                break;
            }
        }
        finalEnclosingRadius = candidateRadiusForN_gt_2; // Assign the calculated value
    }

    console.log('%s', finalEnclosingRadius);
    return finalEnclosingRadius;
}

function testHarnessDebug(testCaseNumber) {
    const inputElement = document.getElementById("input" + testCaseNumber);
    const outputElement = document.getElementById("output" + testCaseNumber);

    if (!inputElement || !outputElement) {
        console.error(`Debug: Elements for test ${testCaseNumber} not found.`);
        return;
    }

    const testInputContent = inputElement.value;
    const actualResultValue = processInputData(testInputContent);
    const expectedOutputString = outputElement.value.split("\n")[0];
    const expectedResultValue = parseFloat(expectedOutputString);

    let testOutcome = "WA"; // Wrong Answer
    if (Math.abs(actualResultValue - expectedResultValue) < ENCLOSURE_TOLERANCE) {
        testOutcome = "AC"; // Accepted
    }

    const resultDisplayElement = document.getElementById("result" + testCaseNumber);
    if (resultDisplayElement) {
        resultDisplayElement.innerHTML = testOutcome;
    } else {
        console.error(`Debug: Result element for test ${testCaseNumber} not found.`);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
