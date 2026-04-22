'use strict';

const ioHandler = require('readline');

const inputProcessor = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let accumulatedData = '';

inputProcessor.on('line', (incomingLine) => {
    accumulatedData += incomingLine;
});

inputProcessor.on('close', () => {
    const calculateTriangleProperties = (sideOne, sideTwo, angleDegrees) => {
        const radianConversionFactor = Math.PI / 180.0;
        const angleInRad = angleDegrees * radianConversionFactor;

        const cosOfAngle = Math.cos(angleInRad);
        const sinOfAngle = Math.sin(angleInRad);

        const thirdSideSquare = Math.pow(sideOne, 2) + Math.pow(sideTwo, 2) - (2 * sideOne * sideTwo * cosOfAngle);
        const thirdSideDimension = Math.sqrt(thirdSideSquare);

        const totalBoundaryLength = sideOne + sideTwo + thirdSideDimension;
        const surfaceArea = (1 / 2) * sideOne * sideTwo * sinOfAngle;
        const perpendicularHeight = sideTwo * sinOfAngle;

        process.stdout.write(surfaceArea.toFixed(8) + ' ' + totalBoundaryLength.toFixed(8) + ' ' + perpendicularHeight.toFixed(8) + '\n');
    };

    const numericElements = accumulatedData.split(' ').map(parseFloat);
    calculateTriangleProperties(...numericElements);
});