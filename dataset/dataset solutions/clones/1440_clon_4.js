const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');

const createPoint = (xCoord, yCoord) => ({
    xComponent: xCoord,
    yComponent: yCoord
});

const calculateDistance = (inputString) => {
    const numericalValues = inputString.trim().split(' ').map(Number);

    const pointOne = createPoint(numericalValues[0], numericalValues[1]);
    const pointTwo = createPoint(numericalValues[2], numericalValues[3]);

    const squareValue = (val) => val * val;

    const deltaX = pointOne.xComponent - pointTwo.xComponent;
    const deltaY = pointOne.yComponent - pointTwo.yComponent;

    const sumOfSquaredDifferences = squareValue(deltaX) + squareValue(deltaY);

    return Math.sqrt(sumOfSquaredDifferences);
};

const finalComputedDistance = calculateDistance(fileData);

console.log(finalComputedDistance.toFixed(5));
