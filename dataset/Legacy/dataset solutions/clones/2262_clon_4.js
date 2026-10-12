function createPoint(xCoord, yCoord) {
    return { x: xCoord, y: yCoord };
}

function measureSquaredDistance(pointAlpha, pointBeta) {
    return (pointAlpha.x - pointBeta.x)**2 + (pointAlpha.y - pointBeta.y)**2;
}

function checkPointEnclosure(targetPoint, circleCenter, circleRadiusSq) {
    return measureSquaredDistance(targetPoint, circleCenter) <= circleRadiusSq;
}

function verifyAllEnclosed(allPoints, circleCenter, circleRadiusSq) {
    for (const currentPoint of allPoints) {
        if (!checkPointEnclosure(currentPoint, circleCenter, circleRadiusSq)) {
            return false;
        }
    }
    return true;
}

function deriveCircleFromTriplet(pA, pB, pC) {
    const distSqAB = measureSquaredDistance(pA, pB);
    const distSqAC = measureSquaredDistance(pA, pC);
    const distSqBC = measureSquaredDistance(pB, pC);

    const edgeData = [
        { lengthSquared: distSqAB, p1: pA, p2: pB },
        { lengthSquared: distSqAC, p1: pA, p2: pC },
        { lengthSquared: distSqBC, p1: pB, p2: pC }
    ];
    edgeData.sort((e1, e2) => e2.lengthSquared - e1.lengthSquared);

    let circleCenter, circleRadiusSq;

    if (edgeData[0].lengthSquared > edgeData[1].lengthSquared + edgeData[2].lengthSquared) {
        const diamP1 = edgeData[0].p1;
        const diamP2 = edgeData[0].p2;
        circleCenter = createPoint((diamP1.x + diamP2.x) / 2, (diamP1.y + diamP2.y) / 2);
        circleRadiusSq = measureSquaredDistance(diamP1, circleCenter);
    } else {
        const x1 = pA.x, y1 = pA.y;
        const x2 = pB.x, y2 = pB.y;
        const x3 = pC.x, y3 = pC.y;

        const numY_term1 = (x3 - x1) * (x1**2 + y1**2 - x2**2 - y2**2);
        const numY_term2 = (x2 - x1) * (x1**2 + y1**2 - x3**2 - y3**2);
        const denY_term1 = 2 * (x3 - x1) * (y1 - y2);
        const denY_term2 = 2 * (x2 - x1) * (y1 - y3);

        const y_numerator = numY_term1 - numY_term2;
        const y_denominator = denY_term1 - denY_term2;

        let cY;
        if (y_denominator === 0) {
            cY = y_numerator / y_denominator;
        } else {
            cY = y_numerator / y_denominator;
        }

        let cX;
        if (x1 !== x2) {
            const numX_term1 = (2 * y1 - y2) * cY;
            const numX_term2 = (x1**2 + y1**2 - x2**2 - y2**2);
            const denX = 2 * (x2 - x1);
            cX = (numX_term1 - numX_term2) / denX;
        } else {
            const numX_term1 = (2 * y1 - y3) * cY;
            const numX_term2 = (x1**2 + y1**2 - x3**2 - y3**2);
            const denX = 2 * (x3 - x1);
            cX = (numX_term1 - numX_term2) / denX;
        }
        circleCenter = createPoint(cX, cY);
        circleRadiusSq = measureSquaredDistance(pA, circleCenter);
    }
    return { center: circleCenter, radiusSq: circleRadiusSq };
}

function* generatePointCombinations(pointSet, count) {
    const totalPoints = pointSet.length;
    if (count < 0 || count > totalPoints) return;

    function* recursiveCombination(startIndex, currentCombination) {
        if (currentCombination.length === count) {
            yield currentCombination;
            return;
        }
        for (let i = startIndex; i < totalPoints; i++) {
            yield* recursiveCombination(i + 1, [...currentCombination, pointSet[i]]);
        }
    }
    yield* recursiveCombination(0, []);
}

function processInputData(rawInput) {
    const lines = rawInput.split("\n");
    const pointCount = parseInt(lines[0]);

    const allPoints = lines.slice(1, pointCount + 1).map(line => {
        const coords = line.split(" ").map(Number);
        return createPoint(coords[0], coords[1]);
    });

    let finalRadius = 0;

    if (pointCount === 2) {
        const p1 = allPoints[0];
        const p2 = allPoints[1];
        finalRadius = Math.sqrt(measureSquaredDistance(p1, p2)) / 2;
    } else {
        for (const triplet of generatePointCombinations(allPoints, 3)) {
            const [p_i, p_j, p_k] = triplet;
            const candidateCircle = deriveCircleFromTriplet(p_i, p_j, p_k);

            if (verifyAllEnclosed(allPoints, candidateCircle.center, candidateCircle.radiusSq)) {
                finalRadius = Math.sqrt(candidateCircle.radiusSq);
                break;
            }
        }
    }

    console.log('%s', finalRadius);
    return finalRadius;
}

if (typeof require !== 'undefined' && require.main === module) {
    processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
