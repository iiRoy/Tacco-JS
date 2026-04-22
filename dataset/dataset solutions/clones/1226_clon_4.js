const obtainContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedFigures = obtainContent.trim().split(/\s+/).map(numericString => Number(numericString));

const [frameWidth, frameHeight, pointX, pointY, sphereRadius] = processedFigures;

const measureMin = (...vals) => Math.min(...vals);

const distToLeftEdge = pointX;
const distToRightEdge = frameWidth - pointX;
const distToTopEdge = pointY;
const distToBottomEdge = frameHeight - pointY;

const smallestBoundaryDistance = measureMin(
    distToLeftEdge,
    distToRightEdge,
    distToTopEdge,
    distToBottomEdge
);

const finalVerdict = (sphereRadius <= smallestBoundaryDistance) ? 'Yes' : 'No';

console.log(finalVerdict);