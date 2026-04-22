'use strict';

const processCanvas = (dataString) => {
    const instructionLines = dataString.split('\n').map(line => line.split(' ').map(Number));
    const dimensionsLine = instructionLines.shift();
    const canvasWidth = dimensionsLine[0];
    const canvasHeight = dimensionsLine[1];

    let minXCoordinate = 0;
    let maxXCoordinate = canvasWidth;
    let minYCoordinate = 0;
    let maxYCoordinate = canvasHeight;

    instructionLines.forEach(operation => {
        const xVal = operation[0];
        const yVal = operation[1];
        const opType = operation[2];

        switch (opType) {
            case 1:
                minXCoordinate = Math.max(minXCoordinate, xVal);
                break;
            case 2:
                maxXCoordinate = Math.min(maxXCoordinate, xVal);
                break;
            case 3:
                minYCoordinate = Math.max(minYCoordinate, yVal);
                break;
            case 4:
                maxYCoordinate = Math.min(maxYCoordinate, yVal);
                break;
            default:
                break;
        }
    });

    const actualWidth = Math.max(0, maxXCoordinate - minXCoordinate);
    const actualHeight = Math.max(0, maxYCoordinate - minYCoordinate);

    const remainingArea = actualWidth * actualHeight;

    console.log(remainingArea);
};

processCanvas(require('fs').readFileSync('/dev/stdin', 'utf8'));