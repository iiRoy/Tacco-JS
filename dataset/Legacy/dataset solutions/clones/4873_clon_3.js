'use strict';

const processInput = rawData => {
    const lines = rawData.trim().split("\n");

    const initialParameters = lines[0].split(' ').map(Number);
    const initialCanvasWidth = initialParameters[0];
    const initialCanvasHeight = initialParameters[1];
    const numberOfOperations = initialParameters[2]; 

    const operationInstructions = lines.slice(1).map(lineContent => {
        const parts = lineContent.split(' ').map(Number);
        return {
            xCoord: parts[0],
            yCoord: parts[1],
            cutType: parts[2]
        };
    });

    let currentMinXBoundary = 0;
    let currentMaxXBoundary = initialCanvasWidth;
    let currentMinYBoundary = 0;
    let currentMaxYBoundary = initialCanvasHeight;

    for (let opIndex = 0; opIndex < operationInstructions.length; opIndex++) {
        const currentInstruction = operationInstructions[opIndex];
        const xValue = currentInstruction.xCoord;
        const yValue = currentInstruction.yCoord;
        const typeOfCut = currentInstruction.cutType;

        switch (typeOfCut) {
            case 1: // x > xValue: cut everything to the left of xValue
                currentMinXBoundary = Math.max(currentMinXBoundary, xValue);
                break;
            case 2: // x < xValue: cut everything to the right of xValue
                currentMaxXBoundary = Math.min(currentMaxXBoundary, xValue);
                break;
            case 3: // y > yValue: cut everything below yValue
                currentMinYBoundary = Math.max(currentMinYBoundary, yValue);
                break;
            case 4: // y < yValue: cut everything above yValue
                currentMaxYBoundary = Math.min(currentMaxYBoundary, yValue);
                break;
        }
    }

    const effectiveWidth = currentMinXBoundary - currentMaxXBoundary;
    const effectiveHeight = currentMinYBoundary - currentMaxYBoundary;

    const calculatedArea = effectiveWidth * effectiveHeight;
    
    console.log(Math.max(0, calculatedArea));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
