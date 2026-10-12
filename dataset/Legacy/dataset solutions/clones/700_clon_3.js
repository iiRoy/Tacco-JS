function deepCopyStructure(sourceObj, targetObj) {
    const hasOwnProp = Object.prototype.hasOwnProperty;

    let destination = targetObj || [];

    for (const propKey in sourceObj) {
        if (hasOwnProp.call(sourceObj, propKey)) {
            const sourceValue = sourceObj[propKey];
            if (typeof sourceValue === "object" && sourceValue !== null) {
                const isSourceArray = Array.isArray(sourceValue);
                destination[propKey] = isSourceArray ? [] : {};
                deepCopyStructure(sourceValue, destination[propKey]);
            } else {
                destination[propKey] = sourceValue;
            }
        }
    }
    return destination;
}

function rotateCoordinates(coordList) {
    const rotatedList = deepCopyStructure(coordList);
    const listLength = rotatedList.length;

    for (let idx = 0; idx < listLength; idx++) {
        const currentPoint = rotatedList[idx];
        const originalX = currentPoint.x;
        const originalY = currentPoint.y;

        currentPoint.x = -originalY;
        currentPoint.y = originalX;
    }
    return rotatedList;
}

function areShapesIdentical(shapeA, shapeB) {
    if (!Array.isArray(shapeA) || !Array.isArray(shapeB)) {
        return false;
    }

    const lenA = shapeA.length;
    const lenB = shapeB.length;

    if (lenA !== lenB) {
        return false;
    }

    for (let idx = 0; idx < lenA; idx++) {
        const point1 = shapeA[idx];
        const point2 = shapeB[idx];

        if (!point1 || !point2 || typeof point1.x === 'undefined' || typeof point1.y === 'undefined' ||
            typeof point2.x === 'undefined' || typeof point2.y === 'undefined') {
            return false;
        }

        if (point1.x !== point2.x || point1.y !== point2.y) {
            return false;
        }
    }
    return true;
}

const parseLineToNumbers = (lineStr) => {
    return lineStr.split(' ').map(Number);
};

const createPoint = (xCoord, yCoord) => ({ x: xCoord, y: yCoord });

(function (rawInput) {
    const rawInputLines = rawInput.replace(/\r/g, '').split("\n");
    let currentLineIndex = 0;

    const getNextInt = () => parseInt(rawInputLines[currentLineIndex++]);

    const getNextCoords = () => {
        const parts = parseLineToNumbers(rawInputLines[currentLineIndex++]);
        return createPoint(parts[0], parts[1]);
    };

    while (true) {
        const allShapeData = [];
        let totalShapeSets = getNextInt() + 1;

        if (totalShapeSets === 1) {
            break;
        }

        while (totalShapeSets-- > 1) {
            const currentShapePoints = [];
            let numPointsInShape = getNextInt() - 1;

            const firstPointCoords = getNextCoords();
            const originX = firstPointCoords.x;
            const originY = firstPointCoords.y;

            currentShapePoints.push(createPoint(0, 0));

            while (numPointsInShape-- > 0) {
                const nextPointCoords = getNextCoords();
                currentShapePoints.push(createPoint(nextPointCoords.x - originX, nextPointCoords.y - originY));
            }
            allShapeData.push(currentShapePoints);
        }

        const targetShape = allShapeData.shift();

        const calculateReversedTargetShape = (originalShape) => {
            const tempReversed = deepCopyStructure(originalShape).reverse();
            const firstPointInReversed = tempReversed[0];
            const reversedOriginX = firstPointInReversed.x;
            const reversedOriginY = firstPointInReversed.y;

            for (let idx = 0; idx < tempReversed.length; idx++) {
                tempReversed[idx].x -= reversedOriginX;
                tempReversed[idx].y -= reversedOriginY;
            }
            return tempReversed;
        };
        const reversedTargetShape = calculateReversedTargetShape(targetShape);

        const totalShapesToCompare = allShapeData.length;
        const NUM_ROTATIONS_PER_SHAPE = 4;

        for (let shapeIdx = 0; shapeIdx < totalShapesToCompare; shapeIdx++) {
            let currentShapeBeingProcessed = allShapeData[shapeIdx];

            for (let rotationIteration = 0; rotationIteration < NUM_ROTATIONS_PER_SHAPE; rotationIteration++) {
                const currentRotatedShape = rotateCoordinates(currentShapeBeingProcessed);

                if (areShapesIdentical(currentRotatedShape, targetShape) || areShapesIdentical(currentRotatedShape, reversedTargetShape)) {
                    console.log(shapeIdx + 1);
                    break;
                }
                currentShapeBeingProcessed = currentRotatedShape;
            }
        }
        console.log("+++++");
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
