let inputCursor = 0;

function transformByRotation(currentShapePoints) {
    return currentShapePoints.map(point => ({
        c1: -point.c2,
        c2: point.c1
    }));
}

function standardizeOrientation(shapePoints) {
    if (shapePoints.length < 2) {
        return shapePoints; // Cannot standardize orientation for shapes with less than 2 points
    }

    let workingPoints = [...shapePoints];
    let secondPoint = workingPoints[1]; // The second point (0-indexed)

    // Note: conditions are re-evaluated based on the *current* state of secondPoint after each potential rotation
    if (secondPoint.c2 > 0) {
        workingPoints = transformByRotation(workingPoints);
        secondPoint = workingPoints[1]; // Update secondPoint reference
    }
    if (secondPoint.c1 < 0) {
        workingPoints = transformByRotation(workingPoints);
        secondPoint = workingPoints[1]; // Update secondPoint reference
    }
    if (secondPoint.c2 < 0) {
        workingPoints = transformByRotation(workingPoints);
        secondPoint = workingPoints[1]; // Update secondPoint reference
    }
    return workingPoints;
}

function ingestAndNormalizeShape(inputLines, currentInputCursorRef) {
    const pointCount = parseInt(inputLines[currentInputCursorRef], 10);
    currentInputCursorRef++;
    let rawPoints = [];

    for (let i = 0; i < pointCount; i++) {
        const coordsStr = inputLines[currentInputCursorRef].split(" ");
        currentInputCursorRef++;
        rawPoints.push({
            c1: parseInt(coordsStr[0], 10),
            c2: parseInt(coordsStr[1], 10)
        });
    }

    if (pointCount === 0) {
        return {
            coordCount: 0,
            pointList: [],
            updatedCursor: currentInputCursorRef
        };
    }

    const initialFirstC1 = rawPoints[0].c1;
    const initialFirstC2 = rawPoints[0].c2;

    const translatedPoints = rawPoints.map((point, index) => {
        if (index === 0) {
            return { c1: 0, c2: 0 };
        }
        return {
            c1: point.c1 - initialFirstC1,
            c2: point.c2 - initialFirstC2
        };
    });

    const finalPoints = pointCount > 1 ? standardizeOrientation(translatedPoints) : translatedPoints;

    return {
        coordCount: pointCount,
        pointList: finalPoints,
        updatedCursor: currentInputCursorRef
    };
}

function createReflectedNormalizedShape(originalShapeData) {
    const originalPoints = originalShapeData.pointList;
    const count = originalShapeData.coordCount;

    if (count === 0) {
        return { coordCount: 0, pointList: [] };
    }

    const reversedPoints = [...originalPoints].reverse();
    const lastOriginalPoint = originalPoints[count - 1];

    const translatedReflectedPoints = reversedPoints.map((point, index) => {
        if (index === 0) { // The first point in the reversed sequence (original last point) becomes (0,0)
            return { c1: 0, c2: 0 };
        }
        return { // Other points are relative to the original last point
            c1: point.c1 - lastOriginalPoint.c1,
            c2: point.c2 - lastOriginalPoint.c2
        };
    });

    const finalReflectedPoints = count > 1 ? standardizeOrientation(translatedReflectedPoints) : translatedReflectedPoints;

    return {
        coordCount: count,
        pointList: finalReflectedPoints
    };
}

function areShapesEquivalent(shapeA, shapeB) {
    if (shapeA.coordCount !== shapeB.coordCount) {
        return false;
    }
    return shapeA.pointList.every((point, index) =>
        point.c1 === shapeB.pointList[index].c1 &&
        point.c2 === shapeB.pointList[index].c2
    );
}

function executeProcessor(rawInput) {
    const inputLines = rawInput.split("\n");
    inputCursor = 0;

    while (true) {
        const currentCandidateCount = parseInt(inputLines[inputCursor], 10);
        inputCursor++;
        if (currentCandidateCount === 0) {
            break;
        }

        let processedShapes = [];
        for (let i = 0; i <= currentCandidateCount; i++) {
            const result = ingestAndNormalizeShape(inputLines, inputCursor);
            processedShapes.push({
                coordCount: result.coordCount,
                pointList: result.pointList
            });
            inputCursor = result.updatedCursor;
        }

        const primaryReferenceShape = processedShapes[0];

        for (let i = 1; i <= currentCandidateCount; i++) {
            const currentCandidateShape = processedShapes[i];

            if (primaryReferenceShape.coordCount === currentCandidateShape.coordCount) {
                let directMatchFound = false;
                if (areShapesEquivalent(primaryReferenceShape, currentCandidateShape)) {
                    console.log(i);
                    directMatchFound = true;
                }

                if (!directMatchFound) {
                    const invertedCandidateShape = createReflectedNormalizedShape(currentCandidateShape);
                    if (areShapesEquivalent(primaryReferenceShape, invertedCandidateShape)) {
                        console.log(i);
                    }
                }
            }
        }
        console.log("+++++");
    }
}

executeProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));