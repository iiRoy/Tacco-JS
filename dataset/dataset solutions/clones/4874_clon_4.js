'use strict'
const processInputData = (rawInputText) => {
    const lineFragments = rawInputText.trim().split("\n");

    const [initialDimensionX, initialDimensionY, operationCount] = lineFragments[0].split(' ').map(Number);

    const operationParameters = lineFragments.slice(1).map(line => line.split(' ').map(Number));

    const boundaryLimits = {
        minXCoord: 0,
        maxXCoord: initialDimensionX,
        minYCoord: 0,
        maxYCoord: initialDimensionY
    };

    const operationHandlers = {
        1: (currentBounds, coordinateVal) => ({ ...currentBounds, minXCoord: Math.max(currentBounds.minXCoord, coordinateVal) }),
        2: (currentBounds, coordinateVal) => ({ ...currentBounds, maxXCoord: Math.min(currentBounds.maxXCoord, coordinateVal) }),
        3: (currentBounds, coordinateVal) => ({ ...currentBounds, minYCoord: Math.max(currentBounds.minYCoord, coordinateVal) }),
        4: (currentBounds, coordinateVal) => ({ ...currentBounds, maxYCoord: Math.min(currentBounds.maxYCoord, coordinateVal) })
    };

    const finalLimits = operationParameters.reduce((currentBounds, [xVal, yVal, actionCode]) => {
        const handler = operationHandlers[actionCode];
        if (handler) {
            return handler(currentBounds, (actionCode === 1 || actionCode === 2) ? xVal : yVal);
        }
        return currentBounds;
    }, boundaryLimits);

    const horizontalExtent = finalLimits.maxXCoord - finalLimits.minXCoord;
    const verticalExtent = finalLimits.maxYCoord - finalLimits.minYCoord;

    const validHorizontal = Math.max(0, horizontalExtent);
    const validVertical = Math.max(0, verticalExtent);

    const resultingArea = validHorizontal * validVertical;

    console.log(resultingArea);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));