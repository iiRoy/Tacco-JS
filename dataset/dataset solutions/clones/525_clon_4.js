const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawData.trim().split("\n");

const configParams = lineSegments.shift().split(" ").map(Number);
const upperBound = configParams[0] - 1;
const countM = configParams[1];
const targetValue = configParams[2];

const numericLines = lineSegments.slice(0, countM).map(Number);
const processedValues = numericLines.filter(val => val !== targetValue).concat(targetValue).sort((a, b) => a - b);

const overallMinimum = processedValues.reduce((acc, element, idx, fullArr) => {
    let currentElementMin = Infinity;
    const lastIndex = fullArr.length - 1;
    const previousElement = idx > 0 ? fullArr[idx - 1] : undefined;
    const nextElement = idx < lastIndex ? fullArr[idx + 1] : undefined;

    if (element < targetValue) {
        if (idx !== 0) {
            currentElementMin = Math.min(currentElementMin, (targetValue - element) * 2 + (upperBound - targetValue + 1) + previousElement);
        } else {
            currentElementMin = Math.min(currentElementMin, (targetValue - element) * 2 + (upperBound - targetValue + 1));
        }
    } else if (element === targetValue) {
        if (idx === 0) {
            currentElementMin = Math.min(currentElementMin, fullArr[lastIndex] - element);
        }
        if (idx === lastIndex) {
            currentElementMin = Math.min(currentElementMin, element - fullArr[0]);
        }
        if (idx !== lastIndex) {
            currentElementMin = Math.min(currentElementMin, targetValue + upperBound - nextElement + 1);
        }
        if (idx !== 0) {
            currentElementMin = Math.min(currentElementMin, upperBound - targetValue + 1 + previousElement);
        }
    } else { // element > targetValue
        if (idx !== lastIndex) {
            currentElementMin = Math.min(currentElementMin, (element - targetValue) * 2 + targetValue + (upperBound - nextElement + 1));
        } else {
            currentElementMin = Math.min(currentElementMin, (element - targetValue) * 2 + targetValue);
        }
    }

    return Math.min(acc, currentElementMin);
}, Infinity);

console.log(overallMinimum * 100);
