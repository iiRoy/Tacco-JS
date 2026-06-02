let inputReadIndex = 0;

function perform90DegreeRotation(xCoords, yCoords, pointCount) {
    for (let loopIndex = 1; loopIndex <= pointCount; loopIndex++) {
        const currentX = xCoords[loopIndex];
        const currentY = yCoords[loopIndex];

        const newXValue = (currentY === 0) ? 0 : currentY * (-1);

        xCoords[loopIndex] = newXValue;
        yCoords[loopIndex] = currentX;
    }
}

function loadAndNormalizeShape(allXCoordinates, allYCoordinates, currentShapeIndex, shapePointCounts, rawInputLines) {
    shapePointCounts[currentShapeIndex] = parseInt(rawInputLines[inputReadIndex++], 10);

    allXCoordinates[currentShapeIndex] = [];
    allYCoordinates[currentShapeIndex] = [];

    const currentShapeX = allXCoordinates[currentShapeIndex];
    const currentShapeY = allYCoordinates[currentShapeIndex];
    const numPoints = shapePointCounts[currentShapeIndex];

    const parseCoordinatePair = (line) => {
        const parts = line.split(" ");
        return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
    };

    for (let loopIndex = 1; loopIndex <= numPoints; loopIndex++) {
        const [xVal, yVal] = parseCoordinatePair(rawInputLines[inputReadIndex]);
        currentShapeX[loopIndex] = xVal;
        currentShapeY[loopIndex] = yVal;
        inputReadIndex++;

        if (loopIndex > 1) {
            currentShapeX[loopIndex] -= currentShapeX[1];
            currentShapeY[loopIndex] -= currentShapeY[1];
        }
    }
    currentShapeX[1] = 0;
    currentShapeY[1] = 0;

    if (currentShapeY[2] > 0) {
        perform90DegreeRotation(currentShapeX, currentShapeY, numPoints);
    }
    if (currentShapeX[2] < 0) {
        perform90DegreeRotation(currentShapeX, currentShapeY, numPoints);
    }
    if (currentShapeY[2] < 0) {
        perform90DegreeRotation(currentShapeX, currentShapeY, numPoints);
    }
}

function invertAndNormalizeShape(xCoords, yCoords, pointCount) {
    const tempXCoords = [...xCoords];
    const tempYCoords = [...yCoords];

    for (let loopIndex = 1; loopIndex <= pointCount; loopIndex++) {
        xCoords[loopIndex] = tempXCoords[pointCount - loopIndex + 1] - tempXCoords[pointCount];
        yCoords[loopIndex] = tempYCoords[pointCount - loopIndex + 1] - tempYCoords[pointCount];
    }

    if (yCoords[2] > 0) {
        perform90DegreeRotation(xCoords, yCoords, pointCount);
    }
    if (xCoords[2] < 0) {
        perform90DegreeRotation(xCoords, yCoords, pointCount);
    }
    if (yCoords[2] < 0) {
        perform90DegreeRotation(xCoords, yCoords, pointCount);
    }
}

function areShapesIdentical(shapeAX, shapeAY, shapeBX, shapeBY, count) {
    for (let pointLoopIndex = 1; pointLoopIndex <= count; pointLoopIndex++) {
        if (shapeAX[pointLoopIndex] !== shapeBX[pointLoopIndex] || shapeAY[pointLoopIndex] !== shapeBY[pointLoopIndex]) {
            return false;
        }
    }
    return true;
}

function processAllShapes(inputString) {
    const rawInputLines = inputString.split("\n");

    while (true) {
        const totalShapesToProcess = parseInt(rawInputLines[inputReadIndex++], 10);
        if (totalShapesToProcess === 0) {
            break;
        }

        const shapePointCounts = [];
        const allXCoordinates = [];
        const allYCoordinates = [];

        for (let shapeIndex = 0; shapeIndex <= totalShapesToProcess; shapeIndex++) {
            loadAndNormalizeShape(allXCoordinates, allYCoordinates, shapeIndex, shapePointCounts, rawInputLines);
        }

        const referenceShapeX = allXCoordinates[0];
        const referenceShapeY = allYCoordinates[0];
        const referencePointCount = shapePointCounts[0];

        for (let currentShapeIndex = 1; currentShapeIndex <= totalShapesToProcess; currentShapeIndex++) {
            const targetShapeX = allXCoordinates[currentShapeIndex];
            const targetShapeY = allYCoordinates[currentShapeIndex];
            const targetPointCount = shapePointCounts[currentShapeIndex];

            if (referencePointCount === targetPointCount) {
                let isShapeMatch = areShapesIdentical(referenceShapeX, referenceShapeY, targetShapeX, targetShapeY, referencePointCount);

                if (isShapeMatch) {
                    console.log(currentShapeIndex);
                } else {
                    invertAndNormalizeShape(targetShapeX, targetShapeY, targetPointCount);

                    isShapeMatch = areShapesIdentical(referenceShapeX, referenceShapeY, targetShapeX, targetShapeY, referencePointCount);
                    if (isShapeMatch) {
                        console.log(currentShapeIndex);
                    }
                }
            }
        }
        console.log("+++++");
    }
}

processAllShapes(require("fs").readFileSync("/dev/stdin", "utf8"));
