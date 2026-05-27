var globalIndex = 0;

function rotateCoordinates(xCoords, yCoords, countPoints) {
    for (var pointIdx = 1; pointIdx <= countPoints; pointIdx++) {
        var tempX = xCoords[pointIdx];
        var newX = yCoords[pointIdx] === 0 ? 0 : yCoords[pointIdx] * (-1);
        xCoords[pointIdx] = newX;
        yCoords[pointIdx] = tempX;
    }
}


function processShapeData(allXArrays, allYArrays, shapeIndex, shapeSizes, rawData) {

    shapeSizes[shapeIndex] = parseInt(rawData[globalIndex++], 10);
    allXArrays[shapeIndex] = [];
    allYArrays[shapeIndex] = [];
    for (var currentPoint = 1; currentPoint <= shapeSizes[0]; currentPoint++) {
        rawData[globalIndex] = rawData[globalIndex].split(" ");
        allXArrays[shapeIndex][currentPoint] = parseInt(rawData[globalIndex][0], 10);
        allYArrays[shapeIndex][currentPoint] = parseInt(rawData[globalIndex++][1], 10);
        if (currentPoint > 1) {
            allXArrays[shapeIndex][currentPoint] -= allXArrays[shapeIndex][1];
            allYArrays[shapeIndex][currentPoint] -= allYArrays[shapeIndex][1];
        }
    }
    allXArrays[shapeIndex][1] = 0;
    allYArrays[shapeIndex][1] = 0;

    if (allYArrays[shapeIndex][2] > 0)
        rotateCoordinates(allXArrays[shapeIndex], allYArrays[shapeIndex], shapeSizes[shapeIndex]);
    if (allXArrays[shapeIndex][2] < 0)
        rotateCoordinates(allXArrays[shapeIndex], allYArrays[shapeIndex], shapeSizes[shapeIndex]);
    if (allYArrays[shapeIndex][2] < 0)
        rotateCoordinates(allXArrays[shapeIndex], allYArrays[shapeIndex], shapeSizes[shapeIndex]);
}

function invertShape(currentX, currentY, numVertices) {
    var originalX = [],
        originalY = [];
    for (var vertexIter = 1; vertexIter <= numVertices; vertexIter++) {
        originalX[vertexIter] = currentX[vertexIter];
        originalY[vertexIter] = currentY[vertexIter];
    }

    for (var vertexIter = 1; vertexIter <= numVertices; vertexIter++) {
        currentX[vertexIter] = originalX[numVertices - vertexIter + 1] - originalX[numVertices];
        currentY[vertexIter] = originalY[numVertices - vertexIter + 1] - originalY[numVertices];
    }

    if (currentY[2] > 0)
        rotateCoordinates(currentX, currentY, numVertices);
    if (currentX[2] < 0)
        rotateCoordinates(currentX, currentY, numVertices);
    if (currentY[2] < 0)
        rotateCoordinates(currentX, currentY, numVertices);

}

function executeProgram(programInput) {
    programInput = programInput.split("\n");

    while (true) {
        var numShapes = parseInt(programInput[globalIndex++], 10);
        if (numShapes === 0)
            break;
        var shapeDimensions = [];
        var xCoordinatesCollection = [],
            yCoordinatesCollection = [];
        for (var shapeIterator = 0; shapeIterator <= numShapes; shapeIterator++)
            processShapeData(xCoordinatesCollection, yCoordinatesCollection, shapeIterator, shapeDimensions, programInput);

        for (var shapeIterator = 1; shapeIterator <= numShapes; shapeIterator++) {
            if (shapeDimensions[0] === shapeDimensions[shapeIterator]) {
                var matchFound = true;
                for (var coordIterator = 1; coordIterator <= shapeDimensions[0]; coordIterator++) {
                    if (xCoordinatesCollection[0][coordIterator] !== xCoordinatesCollection[shapeIterator][coordIterator] ||
                        yCoordinatesCollection[0][coordIterator] !== yCoordinatesCollection[shapeIterator][coordIterator]) {
                        matchFound = false;
                        break;
                    }
                }
                if (matchFound)
                    console.log(shapeIterator);
                else {
                    invertShape(xCoordinatesCollection[shapeIterator], yCoordinatesCollection[shapeIterator], shapeDimensions[shapeIterator]);
                    var matchFound = true;
                    for (var coordIterator = 1; coordIterator <= shapeDimensions[0]; coordIterator++) {
                        if (xCoordinatesCollection[0][coordIterator] !== xCoordinatesCollection[shapeIterator][coordIterator] ||
                            yCoordinatesCollection[0][coordIterator] !== yCoordinatesCollection[shapeIterator][coordIterator]) {
                            matchFound = false;
                            break;
                        }
                    }
                    if (matchFound)
                        console.log(shapeIterator);

                }
            }
        }
        console.log("+++++");
    }
}
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
