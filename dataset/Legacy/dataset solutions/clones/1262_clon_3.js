var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

function constructHollowRectangle(rectHeight, rectWidth) {
    const borderSymbol = '#';
    const interiorSymbol = '.';
    let currentRectString = '';

    for (let rowIdx = 0; rowIdx < rectHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < rectWidth; colIdx++) {
            const isFirstRow = (rowIdx === 0);
            const isLastRow = (rowIdx === rectHeight - 1);
            const isFirstCol = (colIdx === 0);
            const isLastCol = (colIdx === rectWidth - 1);

            if (isFirstRow || isLastRow || isFirstCol || isLastCol) {
                currentRectString += borderSymbol;
            } else {
                currentRectString += interiorSymbol;
            }
        }
        currentRectString += '\n';
    }
    return currentRectString;
}

let lineSegments = rawData.split("\n");

for (let lineIndex = 0; lineIndex < lineSegments.length; lineIndex++) {
    const dimensionParts = lineSegments[lineIndex].split(" ");
    const heightVal = Number(dimensionParts[0]);
    const widthVal = Number(dimensionParts[1]);

    if (heightVal === 0 && widthVal === 0) {
        break;
    }

    const rectangleOutput = constructHollowRectangle(heightVal, widthVal);
    console.log(rectangleOutput);
}
