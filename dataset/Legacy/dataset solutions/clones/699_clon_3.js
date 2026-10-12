let globalInputIndex = 0;

function rotateCoordinates90(xCoordinates, yCoordinates, pointCount) {
    for (let i = 1; i <= pointCount; i++) {
        const currentX = xCoordinates[i];
        const transformedY = yCoordinates[i] === 0 ? 0 : yCoordinates[i] * (-1);
        xCoordinates[i] = transformedY;
        yCoordinates[i] = currentX;
    }
}

function applyConditionalRotations(xArr, yArr, count) {
    if (yArr[2] > 0) {
        rotateCoordinates90(xArr, yArr, count);
    }
    if (xArr[2] < 0) {
        rotateCoordinates90(xArr, yArr, count);
    }
    if (yArr[2] < 0) {
        rotateCoordinates90(xArr, yArr, count);
    }
}

function processShapeDefinition(allXCoords, allYCoords, currentShapeIndex, shapeSizesArray, rawInputData) {
    shapeSizesArray[currentShapeIndex] = parseInt(rawInputData[globalInputIndex++], 10);

    allXCoords[currentShapeIndex] = [];
    allYCoords[currentShapeIndex] = [];

    const currentShapePointCount = shapeSizesArray[currentShapeIndex];

    for (let pointIdx = 1; pointIdx <= currentShapePointCount; pointIdx++) {
        rawInputData[globalInputIndex] = rawInputData[globalInputIndex].split(" ");
        
        const parsedX = parseInt(rawInputData[globalInputIndex][0], 10);
        const parsedY = parseInt(rawInputData[globalInputIndex++][1], 10);

        allXCoords[currentShapeIndex][pointIdx] = parsedX;
        allYCoords[currentShapeIndex][pointIdx] = parsedY;

        if (pointIdx > 1) {
            allXCoords[currentShapeIndex][pointIdx] -= allXCoords[currentShapeIndex][1];
            allYCoords[currentShapeIndex][pointIdx] -= allYCoords[currentShapeIndex][1];
        }
    }
    allXCoords[currentShapeIndex][1] = 0;
    allYCoords[currentShapeIndex][1] = 0;

    applyConditionalRotations(allXCoords[currentShapeIndex], allYCoords[currentShapeIndex], currentShapePointCount);
}

function invertShapeCoordinates(xShapeCoords, yShapeCoords, shapePointCount) {
    const tempOriginalX = Array.from({ length: shapePointCount + 1 }, (_, i) => xShapeCoords[i]);
    const tempOriginalY = Array.from({ length: shapePointCount + 1 }, (_, i) => yShapeCoords[i]);

    for (let i = 1; i <= shapePointCount; i++) {
        xShapeCoords[i] = tempOriginalX[shapePointCount - i + 1] - tempOriginalX[shapePointCount];
        yShapeCoords[i] = tempOriginalY[shapePointCount - i + 1] - tempOriginalY[shapePointCount];
    }

    applyConditionalRotations(xShapeCoords, yShapeCoords, shapePointCount);
}

function areShapesIdentical(x1Arr, y1Arr, x2Arr, y2Arr, count) {
    for (let j = 1; j <= count; j++) {
        if (x1Arr[j] !== x2Arr[j] || y1Arr[j] !== y2Arr[j]) {
            return false;
        }
    }
    return true;
}

function processGeometricData(inputString) {
    const rawInputLines = inputString.split("\n");

    while (true) {
        const numShapesToProcess = parseInt(rawInputLines[globalInputIndex++], 10);
        if (numShapesToProcess === 0) {
            break;
        }

        const shapeDimensions = [];
        const allXCoordinates = [];
        const allYCoordinates = [];

        for (let shapeIdx = 0; shapeIdx <= numShapesToProcess; shapeIdx++) {
            processShapeDefinition(allXCoordinates, allYCoordinates, shapeIdx, shapeDimensions, rawInputLines);
        }

        const referenceShapePointCount = shapeDimensions[0];
        const referenceXCoords = allXCoordinates[0];
        const referenceYCoords = allYCoordinates[0];

        for (let currentShapeIdx = 1; currentShapeIdx <= numShapesToProcess; currentShapeIdx++) {
            const currentShapeXCoords = allXCoordinates[currentShapeIdx];
            const currentShapeYCoords = allYCoordinates[currentShapeIdx];
            const currentShapePointCount = shapeDimensions[currentShapeIdx];

            if (referenceShapePointCount === currentShapePointCount) {
                let isDirectMatch = areShapesIdentical(referenceXCoords, referenceYCoords, currentShapeXCoords, currentShapeYCoords, referenceShapePointCount);

                if (isDirectMatch) {
                    console.log(currentShapeIdx);
                } else {
                    invertShapeCoordinates(currentShapeXCoords, currentShapeYCoords, currentShapePointCount);
                    
                    let isInvertedMatch = areShapesIdentical(referenceXCoords, referenceYCoords, currentShapeXCoords, currentShapeYCoords, referenceShapePointCount);
                    if (isInvertedMatch) {
                        console.log(currentShapeIdx);
                    }
                }
            }
        }
        console.log("+++++");
    }
}

processGeometricData(require("fs").readFileSync("/dev/stdin", "utf8"));
