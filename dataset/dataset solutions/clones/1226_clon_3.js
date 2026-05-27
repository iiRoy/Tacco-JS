const STD_IN_PATH = '/dev/stdin';
const rawInputData = require('fs').readFileSync(STD_IN_PATH, 'utf8');
const numericValues = rawInputData.split(' ').map(strVal => parseInt(strVal, 10));

const boundaryWidth = numericValues[0];
const boundaryHeight = numericValues[1];
const circleCenterX = numericValues[2];
const circleCenterY = numericValues[3];
const circleRadius = numericValues[4];

const determineCoordinateBounds = (centerCoordinate, radiusValue) => {
    const lowerBound = centerCoordinate - radiusValue;
    const upperBound = centerCoordinate + radiusValue;
    return { lower: lowerBound, upper: upperBound };
};

const xCoordinateBounds = determineCoordinateBounds(circleCenterX, circleRadius);
const yCoordinateBounds = determineCoordinateBounds(circleCenterY, circleRadius);

const effectiveMinX = xCoordinateBounds.lower;
const effectiveMaxX = xCoordinateBounds.upper;
const effectiveMinY = yCoordinateBounds.lower;
const effectiveMaxY = yCoordinateBounds.upper;

const isXAxisWithinLimits = (effectiveMinX >= 0) && (effectiveMaxX <= boundaryWidth);
const isYAxisWithinLimits = (effectiveMinY >= 0) && (effectiveMaxY <= boundaryHeight);

const isCircleFullyContained = isXAxisWithinLimits && isYAxisWithinLimits;

if (isCircleFullyContained) {
    console.log('Yes');
} else {
    console.log('No');
}
