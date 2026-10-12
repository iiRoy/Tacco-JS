let coordX = 0;
let coordY = 0;
let currentAngleDegrees = 0;

const DEG_TO_RAD_CONVERSION_FACTOR = Math.PI / 180;

const convertAngleToRadians = (degrees) => degrees * DEG_TO_RAD_CONVERSION_FACTOR;

require("fs").readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .forEach(function(inputLine) {
        const lineSegments = inputLine.split(',');
        const distanceMagnitude = +lineSegments[0];
        const angleDelta = +lineSegments[1];

        if (distanceMagnitude && angleDelta) {
            const angleInRadians = convertAngleToRadians(currentAngleDegrees);

            coordX += distanceMagnitude * Math.sin(angleInRadians);
            coordY += distanceMagnitude * Math.cos(angleInRadians);

            currentAngleDegrees += angleDelta;
        }
    });

console.log(Math.trunc(coordX));
console.log(Math.trunc(coordY));
