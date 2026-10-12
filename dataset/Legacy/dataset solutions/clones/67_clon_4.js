const fileSystemModule = require("fs");

const initialCoordinates = {
  horizontalOffset: 0,
  verticalOffset: 0,
  currentBearingDegrees: 0,
};

const finalCoordinates = fileSystemModule
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split('\n')
  .reduce((accumulatorState, lineOfInput) => {
    const [distanceValue, angleChangeValue] = lineOfInput.split(',');
    const travelDistance = parseFloat(distanceValue);
    const rotationDegrees = parseFloat(angleChangeValue);

    const currentBearingRadians = accumulatorState.currentBearingDegrees * Math.PI / 180;

    const displacementX = travelDistance * Math.sin(currentBearingRadians);
    const displacementY = travelDistance * Math.cos(currentBearingRadians);

    accumulatorState.horizontalOffset += displacementX;
    accumulatorState.verticalOffset += displacementY;
    accumulatorState.currentBearingDegrees += rotationDegrees;

    return accumulatorState;
  }, initialCoordinates);

console.log(~~finalCoordinates.horizontalOffset);
console.log(~~finalCoordinates.verticalOffset);
