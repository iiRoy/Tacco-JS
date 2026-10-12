let coordX = 0;
let coordY = 0;
let currentRotationDegrees = 0;

const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180;

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = fileContent.trim().split('\n');

lines.forEach(function(inputLine) {
    const lineComponents = inputLine.split(',');

    const stepMagnitude = parseFloat(lineComponents[0]);
    const angleDelta = parseFloat(lineComponents[1]);

    const angleInRadians = currentRotationDegrees * DEGREES_TO_RADIANS_FACTOR;

    coordX += stepMagnitude * Math.sin(angleInRadians);
    coordY += stepMagnitude * Math.cos(angleInRadians);

    currentRotationDegrees += angleDelta;
});

console.log(~~coordX);
console.log(~~coordY);
