const acquiredData = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')[0].split(' ').map(Number);
const firstSide = acquiredData[0];
const secondSide = acquiredData[1];
const requiredCapacity = acquiredData[2];

const entireSolidCapacity = firstSide * firstSide * secondSide;

const locateOptimalAngle = (lowerBound, upperBound, iterationCounter, volumeDeterminantFn, adjustmentPredicate) => {
    if (iterationCounter > 200) {
        return (lowerBound + upperBound) / 2;
    }

    const currentMidpoint = (lowerBound + upperBound) / 2;
    const computedVolume = volumeDeterminantFn(currentMidpoint);

    if (adjustmentPredicate(requiredCapacity, computedVolume)) {
        return locateOptimalAngle(currentMidpoint, upperBound, iterationCounter + 1, volumeDeterminantFn, adjustmentPredicate);
    } else {
        return locateOptimalAngle(lowerBound, currentMidpoint, iterationCounter + 1, volumeDeterminantFn, adjustmentPredicate);
    }
};

let ultimateAngle;

if (requiredCapacity > entireSolidCapacity / 2) {
    const calculateRemainingCapacity = (angleInputDegrees) => {
        const angleInputRadians = angleInputDegrees * Math.PI / 180;
        const removedWedgeCapacity = (firstSide * firstSide * Math.tan(angleInputRadians)) / 2 * firstSide;
        return entireSolidCapacity - removedWedgeCapacity;
    };

    ultimateAngle = locateOptimalAngle(
        0, 90, 0,
        calculateRemainingCapacity,
        (targetValue, currentValue) => targetValue < currentValue
    );

    console.log(ultimateAngle.toFixed(10));

} else {
    const calculateRemovedWedgeCapacity = (angleInputDegrees) => {
        const angleInputRadians = angleInputDegrees * Math.PI / 180;
        return (secondSide * secondSide * Math.tan(angleInputRadians)) / 2 * firstSide;
    };

    const angleFromVertical = locateOptimalAngle(
        0, 90, 0,
        calculateRemovedWedgeCapacity,
        (targetValue, currentValue) => targetValue < currentValue
    );

    ultimateAngle = 90 - angleFromVertical;
    console.log(ultimateAngle.toFixed(10));
}