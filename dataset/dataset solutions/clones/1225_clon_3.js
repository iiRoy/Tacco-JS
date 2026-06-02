'use strict';

function parseInputString(dataBuffer) {
    const rawString = dataBuffer.toString().trim();
    const stringParts = rawString.split(' ');
    return stringParts.map(Number);
}

function checkCircleBoundaryCondition(widthDim, heightDim, centerX, centerY, radiusVal) {
    const xOffsetLeft = widthDim - centerX - radiusVal;
    const xOffsetRight = widthDim - centerX + radiusVal;
    const yOffsetTop = heightDim - centerY - radiusVal;
    const yOffsetBottom = heightDim - centerY + radiusVal;

    const horizontalBoundsMet = xOffsetLeft >= 0 && xOffsetRight <= widthDim;
    const verticalBoundsMet = yOffsetTop <= 0 && yOffsetBottom >= heightDim;

    return horizontalBoundsMet && verticalBoundsMet;
}

process.stdin.on('data', function(inputBuffer) {
    const numericValues = parseInputString(inputBuffer);

    const [canvasWidth, canvasHeight, circleXCoord, circleYCoord, circleRadiusVal] = numericValues;

    const isConditionMet = checkCircleBoundaryCondition(
        canvasWidth,
        canvasHeight,
        circleXCoord,
        circleYCoord,
        circleRadiusVal
    );

    const positiveOutcomeMessage = 'Yes';
    const negativeOutcomeMessage = 'No';

    if (isConditionMet) {
        console.log(positiveOutcomeMessage);
    } else {
        console.log(negativeOutcomeMessage);
    }
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
