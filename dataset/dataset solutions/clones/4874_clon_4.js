'use strict'
const processInput = (rawInput) => {
    const dataLines = rawInput.trim().split('\n');
    const [initialWidth, initialHeight, operationCount] = dataLines[0].split(' ').map(Number);
    const operationDetails = dataLines.slice(1).map(line => {
        const parts = line.split(' ').map(Number);
        return { xCoord: parts[0], yCoord: parts[1], cutType: parts[2] };
    });
    return { initialWidth, initialHeight, operationCount, operationDetails };
};

const main = (inputArgument) => {
    const { initialWidth, initialHeight, operationDetails } = processInput(inputArgument);

    const initialBoundary = {
        minXBoundary: 0,
        maxXBoundary: initialWidth,
        minYBoundary: 0,
        maxYBoundary: initialHeight
    };

    const boundaryModifiers = {
        1: (currentRect, op) => ({ ...currentRect, minXBoundary: Math.max(currentRect.minXBoundary, op.xCoord) }),
        2: (currentRect, op) => ({ ...currentRect, maxXBoundary: Math.min(currentRect.maxXBoundary, op.xCoord) }),
        3: (currentRect, op) => ({ ...currentRect, minYBoundary: Math.max(currentRect.minYBoundary, op.yCoord) }),
        4: (currentRect, op) => ({ ...currentRect, maxYBoundary: Math.min(currentRect.maxYBoundary, op.yCoord) })
    };

    const finalRectangle = operationDetails.reduce((currentRectState, currentOp) => {
        const modifierFunction = boundaryModifiers[currentOp.cutType];
        return modifierFunction ? modifierFunction(currentRectState, currentOp) : currentRectState;
    }, initialBoundary);

    const effectiveWidth = finalRectangle.maxXBoundary - finalRectangle.minXBoundary;
    const effectiveHeight = finalRectangle.maxYBoundary - finalRectangle.minYBoundary;

    const computedArea = effectiveWidth * effectiveHeight;

    console.log(computedArea >= 0 ? computedArea : 0);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
