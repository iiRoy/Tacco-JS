'use strict'

const processInputData = (incomingText) => {
    const contentLines = incomingText.trim().split('\n');

    const [boundaryX, boundaryY, directiveCount] = contentLines[0].split(' ').map(Number);

    const operations = contentLines.slice(1).map(lineOfOps => {
        const [posX, posY, opCode] = lineOfOps.split(' ').map(Number);
        return { xVal: posX, yVal: posY, typeVal: opCode };
    });

    return { initialX: boundaryX, initialY: boundaryY, allOperations: operations };
};

const determineResultingArea = (dimensionX, dimensionY) => {
    if (dimensionX <= 0 || dimensionY <= 0) {
        return 0;
    }
    return dimensionX * dimensionY;
};

const applySingleOperation = (currentRectangle, currentOperation) => {
    let { leftBound, rightBound, bottomBound, topBound } = currentRectangle;
    const { xVal, yVal, typeVal } = currentOperation;

    const operationDispatch = {
        1: () => ({ ...currentRectangle, leftBound: Math.max(leftBound, xVal) }),
        2: () => ({ ...currentRectangle, rightBound: Math.min(rightBound, xVal) }),
        3: () => ({ ...currentRectangle, bottomBound: Math.max(bottomBound, yVal) }),
        4: () => ({ ...currentRectangle, topBound: Math.min(topBound, yVal) }),
    };

    return operationDispatch[typeVal] ? operationDispatch[typeVal]() : currentRectangle;
};

const executeTransformation = (sourceText) => {
    const { initialX, initialY, allOperations } = processInputData(sourceText);

    const startingRectangle = {
        leftBound: 0,
        rightBound: initialX,
        bottomBound: 0,
        topBound: initialY,
    };

    const finalRectangle = allOperations.reduce(applySingleOperation, startingRectangle);

    const finalSpanX = finalRectangle.rightBound - finalRectangle.leftBound;
    const finalSpanY = finalRectangle.topBound - finalRectangle.bottomBound;

    return determineResultingArea(finalSpanX, finalSpanY);
};

const entryPoint = (incomingRawText) => {
    const computedValue = executeTransformation(incomingRawText);
    console.log(computedValue);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));