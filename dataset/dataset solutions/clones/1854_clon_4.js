const streamContent = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedNumericalData = streamContent.split(/\s+/).filter(Boolean).map(Number);

let currentPosition = 0;
const extractNextNumeric = () => parsedNumericalData[currentPosition++];
const gatherSpecificQuantities = (count) => {
    const collected = [];
    for (let k = 0; k < count; k++) {
        collected.push(extractNextNumeric());
    }
    return collected;
};

const [firstSideLength, secondSideLength, clockDialHours, clockDialMinutes] = gatherSpecificQuantities(4);

const minuteHandPosition = clockDialMinutes * 6.0;
const hourHandPosition = ((clockDialHours % 12) + (clockDialMinutes / 60.0)) * 30.0;

let angularSeparation = Math.abs(minuteHandPosition - hourHandPosition);
const normalizedSeparation = Math.min(angularSeparation, 360.0 - angularSeparation);

const piValue = Math.acos(-1);
const radianMeasure = normalizedSeparation * (piValue / 180.0);

const xCoordinateOfThirdVertex = secondSideLength * Math.cos(radianMeasure);
const yCoordinateOfThirdVertex = secondSideLength * Math.sin(radianMeasure);

const deltaXComponent = firstSideLength - xCoordinateOfThirdVertex;
const deltaYComponent = 0 - yCoordinateOfThirdVertex;

const finalDistance = Math.sqrt(deltaXComponent * deltaXComponent + deltaYComponent * deltaYComponent);

console.log(finalDistance);