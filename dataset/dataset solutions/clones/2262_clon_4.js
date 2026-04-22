const squaredEuclideanDistance = (firstPoint, secondPoint) => {
    const horizontalDelta = firstPoint.posH - secondPoint.posH;
    const verticalDelta = firstPoint.posV - secondPoint.posV;
    return (horizontalDelta ** 2) + (verticalDelta ** 2);
};

const calculateMidpoint = (firstPoint, secondPoint) => ({
    posH: (firstPoint.posH + secondPoint.posH) / 2,
    posV: (firstPoint.posV + secondPoint.posV) / 2,
});

const verifyAllPointsEnclosed = (cirCenter, cirSqRadius, entirePointSet) => {
    for (const currentPoint of entirePointSet) {
        if (squaredEuclideanDistance(currentPoint, cirCenter) > cirSqRadius) {
            return false;
        }
    }
    return true;
};

const findCircleParameters = (pA, pB, pC) => {
    const distAB_sq = squaredEuclideanDistance(pA, pB);
    const distAC_sq = squaredEuclideanDistance(pA, pC);
    const distBC_sq = squaredEuclideanDistance(pB, pC);

    const segmentMeasures = [
        { value: distAB_sq, identifier: 0 },
        { value: distAC_sq, identifier: 1 },
        { value: distBC_sq, identifier: 2 },
    ];

    segmentMeasures.sort((s1, s2) => s2.value - s1.value);

    if (segmentMeasures[0].value > segmentMeasures[1].value + segmentMeasures[2].value) {
        let definingPoint1, definingPoint2;
        switch (segmentMeasures[0].identifier) {
            case 0:
                definingPoint1 = pA;
                definingPoint2 = pB;
                break;
            case 1:
                definingPoint1 = pA;
                definingPoint2 = pC;
                break;
            case 2:
                definingPoint1 = pB;
                definingPoint2 = pC;
                break;
        }
        return {
            center: calculateMidpoint(definingPoint1, definingPoint2),
            sqRadius: squaredEuclideanDistance(definingPoint1, definingPoint2) / 4,
        };
    } else {
        const x1 = pA.posH, y1 = pA.posV;
        const x2 = pB.posH, y2 = pB.posV;
        const x3 = pC.posH, y3 = pC.posV;

        const s1 = (x1 ** 2) + (y1 ** 2);
        const s2 = (x2 ** 2) + (y2 ** 2);
        const s3 = (x3 ** 2) + (y3 ** 2);

        const determinant = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));

        const centralY = ((x3 - x1) * (s1 - s2) - (x2 - x1) * (s1 - s3)) / determinant;
        let centralX;

        if (x1 !== x2) {
            centralX = (s2 - s1 + 2 * centralY * (y1 - y2)) / (2 * (x2 - x1));
        } else {
            centralX = (s3 - s1 + 2 * centralY * (y1 - y3)) / (2 * (x3 - x1));
        }

        return {
            center: { posH: centralX, posV: centralY },
            sqRadius: squaredEuclideanDistance(pA, { posH: centralX, posV: centralY }),
        };
    }
};

if (!String.prototype.partition) {
    String.prototype.partition = function(separator) {
        return this.split(separator);
    };
}
if (!Array.prototype.transform) {
    Array.prototype.transform = function(mapper) {
        return this.map(mapper);
    };
}
if (!Array.prototype.removeFirstEntry) {
    Array.prototype.removeFirstEntry = function() {
        return this.shift();
    };
}

const processInputData = (rawData) => {
    const lines = rawData.partition(/\r?\n/).filter(line => line.length > 0);
    let quantityOfCoordinates = Number.parseInt(lines.removeFirstEntry());

    const coordinateSet = lines
        .slice(0, quantityOfCoordinates)
        .transform(entry => {
            const parts = entry.partition(' ').transform(Number.parseInt);
            return { posH: parts[0], posV: parts[1] };
        });

    let finalResult = 0;

    if (coordinateSet.length === 2) {
        finalResult = (squaredEuclideanDistance(coordinateSet[0], coordinateSet[1]) ** 0.5) / 2;
    } else {
        function* createIndexCombinations(totalElements, combinationSize) {
            function* generate(currentCombo = [], start = 0) {
                if (currentCombo.length === combinationSize) {
                    yield currentCombo;
                    return;
                }
                for (let currentIter = start; currentIter < totalElements; currentIter++) {
                    currentCombo.push(currentIter);
                    yield* generate(currentCombo, currentIter + 1);
                    currentCombo.pop();
                }
            }
            yield* generate();
        }

        const combinationIterator = createIndexCombinations(quantityOfCoordinates, 3);

        for (const [idxA, idxB, idxC] of combinationIterator) {
            const pA = coordinateSet[idxA];
            const pB = coordinateSet[idxB];
            const pC = coordinateSet[idxC];

            const candidateCircle = findCircleParameters(pA, pB, pC);

            if (verifyAllPointsEnclosed(candidateCircle.center, candidateCircle.sqRadius, coordinateSet)) {
                finalResult = candidateCircle.sqRadius ** 0.5;
                break;
            }
        }
    }

    process.stdout.write(finalResult.toString());
    return finalResult;
};

if (typeof require !== 'undefined' && require.main === module) {
    const fileSystem = require("fs");
    const programInput = fileSystem.readFileSync("/dev/stdin", "utf8");
    processInputData(programInput);
}