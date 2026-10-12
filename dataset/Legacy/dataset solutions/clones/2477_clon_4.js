const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const firstLineParts = inputLines.shift().split(' ');

const dimensionA = Number(firstLineParts.shift());
const dimensionB = Number(firstLineParts.shift());
const waterVolume = Number(firstLineParts.shift());

const totalContainerVolume = dimensionA * dimensionA * dimensionB;

let finalAngleResultDegrees;

if (totalContainerVolume / 2 < waterVolume) {
    const tangentCalculationValue = (totalContainerVolume - waterVolume) * 2 / (dimensionA * dimensionA * dimensionA);
    const angleInRadians = Math.atan(tangentCalculationValue);
    finalAngleResultDegrees = angleInRadians * 180 / Math.PI;
} else {
    const tangentCalculationValue = waterVolume * 2 / (dimensionA * dimensionB * dimensionB);
    const angleInRadians = Math.atan(tangentCalculationValue);
    const temporaryAngleDegrees = angleInRadians * 180 / Math.PI;
    finalAngleResultDegrees = 90 - temporaryAngleDegrees;
}

console.log(finalAngleResultDegrees.toFixed(10));
