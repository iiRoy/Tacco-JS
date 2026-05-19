class CoordinatePair {
    constructor(xCoord, yCoord) {
        this.xCoord = xCoord;
        this.yCoord = yCoord;
    }

    rotateNinetyDegrees() {
        const oldX = this.xCoord;
        this.xCoord = this.yCoord * -1;
        this.yCoord = oldX;
    }

    isEquivalent(otherPair) {
        return this.xCoord === otherPair.xCoord && this.yCoord === otherPair.yCoord;
    }
}

const dataStream = {
    sourceLines: [],
    currentPosition: 0,
    fetchInteger: function() { return parseInt(this.sourceLines[this.currentPosition++], 10); },
    fetchSplitLine: function() { return this.sourceLines[this.currentPosition++].split(" "); }
};

function performCoordinateRotation(pointList, countLimit) {
    for (let idx = 1; idx <= countLimit; idx++) {
        pointList[idx].rotateNinetyDegrees();
    }
}

function buildShapeFromInput(inputReader) {
    const pointQuantity = inputReader.fetchInteger();
    const rawPointData = Array.from({ length: pointQuantity }, () => {
        const parts = inputReader.fetchSplitLine();
        return new CoordinatePair(parseInt(parts[0], 10), parseInt(parts[1], 10));
    });

    const shapePoints = [null, ...rawPointData];

    const initialX = shapePoints[1].xCoord;
    const initialY = shapePoints[1].yCoord;
    shapePoints.forEach((pair, index) => {
        if (index > 0) {
            pair.xCoord -= initialX;
            pair.yCoord -= initialY;
        }
    });
    shapePoints[1].xCoord = 0;
    shapePoints[1].yCoord = 0;

    if (shapePoints[2].yCoord > 0) performCoordinateRotation(shapePoints, pointQuantity);
    if (shapePoints[2].xCoord < 0) performCoordinateRotation(shapePoints, pointQuantity);
    if (shapePoints[2].yCoord < 0) performCoordinateRotation(shapePoints, pointQuantity);

    return { pointCount: pointQuantity, points: shapePoints };
}

function transformShapeInverse(targetShape) {
    const originalSnapshots = Array.from({ length: targetShape.pointCount + 1 }, (_, idx) =>
        idx === 0 ? null : new CoordinatePair(targetShape.points[idx].xCoord, targetShape.points[idx].yCoord)
    );

    const transformedPoints = Array.from({ length: targetShape.pointCount + 1 });
    transformedPoints[0] = null;

    for (let idx = 1; idx <= targetShape.pointCount; idx++) {
        transformedPoints[idx] = new CoordinatePair(
            originalSnapshots[targetShape.pointCount - idx + 1].xCoord - originalSnapshots[targetShape.pointCount].xCoord,
            originalSnapshots[targetShape.pointCount - idx + 1].yCoord - originalSnapshots[targetShape.pointCount].yCoord
        );
    }
    targetShape.points = transformedPoints;

    if (targetShape.points[2].yCoord > 0) performCoordinateRotation(targetShape.points, targetShape.pointCount);
    if (targetShape.points[2].xCoord < 0) performCoordinateRotation(targetShape.points, targetShape.pointCount);
    if (targetShape.points[2].yCoord < 0) performCoordinateRotation(targetShape.points, targetShape.pointCount);
}

function compareShapeEquivalence(firstShape, secondShape) {
    if (firstShape.pointCount !== secondShape.pointCount) {
        return false;
    }
    return Array.from({ length: firstShape.pointCount }, (_, i) => i + 1)
                .every(idx => firstShape.points[idx].isEquivalent(secondShape.points[idx]));
}

function analyzeGeometricPatterns(rawData) {
    dataStream.sourceLines = rawData.split("\n");

    while (true) {
        const currentShapeSetSize = dataStream.fetchInteger();
        if (currentShapeSetSize === 0) {
            break;
        }

        const allProcessedShapes = Array.from({ length: currentShapeSetSize + 1 }, (_, shapeIdx) =>
            buildShapeFromInput(dataStream)
        );

        const referenceShape = allProcessedShapes[0];

        for (let shapeIdx = 1; shapeIdx <= currentShapeSetSize; shapeIdx++) {
            let isMatch = false;
            if (compareShapeEquivalence(referenceShape, allProcessedShapes[shapeIdx])) {
                isMatch = true;
            } else {
                transformShapeInverse(allProcessedShapes[shapeIdx]);
                if (compareShapeEquivalence(referenceShape, allProcessedShapes[shapeIdx])) {
                    isMatch = true;
                }
            }

            if (isMatch) {
                console.log(shapeIdx);
            }
        }
        console.log("+++++");
    }
}

analyzeGeometricPatterns(require("fs").readFileSync("/dev/stdin","utf8"));
