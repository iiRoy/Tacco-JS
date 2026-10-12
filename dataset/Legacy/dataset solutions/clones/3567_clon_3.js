const fileSystemModule = require('fs');
const fileContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const allInputLines = fileContentBuffer.split('\n');

const parseNumericValue = (strValue) => Number(strValue);

const firstDataLine = allInputLines.shift();
const coordinateStringParts = firstDataLine.split(' ');

const pointOne = {
    x: parseNumericValue(coordinateStringParts.shift()),
    y: parseNumericValue(coordinateStringParts.shift())
};

const pointTwo = {
    x: parseNumericValue(coordinateStringParts.shift()),
    y: parseNumericValue(coordinateStringParts.shift())
};

const deltaXComponent = pointOne.x - pointTwo.x;
const deltaYComponent = pointOne.y - pointTwo.y;

const pointThreeX = pointTwo.x + deltaYComponent;
const pointThreeY = pointTwo.y - deltaXComponent;

const pointFourX = pointOne.x + deltaYComponent;
const pointFourY = pointOne.y - deltaXComponent;

console.log('%d %d %d %d', pointThreeX, pointThreeY, pointFourX, pointFourY);
