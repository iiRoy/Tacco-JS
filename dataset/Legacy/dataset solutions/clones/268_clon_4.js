const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const numericLines = fileContent.split('\n').map(Number);

const collectedPairs = [];
let currentPosition = 0;

while (currentPosition < numericLines.length - 1) {
    const firstOperand = numericLines[currentPosition];
    const secondOperand = numericLines[currentPosition + 1];

    if (firstOperand === 0 && secondOperand === 0) {
        break;
    }

    collectedPairs.push({ base: firstOperand, elev: secondOperand });
    currentPosition += 2;
}

const calculatePyramidSurface = (baseDimension, verticalHeight) => {
    const baseArea = baseDimension * baseDimension;
    const slantHeightTerm = Math.sqrt(4 * verticalHeight * verticalHeight + baseDimension * baseDimension);
    return (baseArea + baseDimension * slantHeightTerm).toFixed(6);
};

collectedPairs
    .map(pairData => calculatePyramidSurface(pairData.base, pairData.elev))
    .forEach(formattedResult => console.log(formattedResult));
