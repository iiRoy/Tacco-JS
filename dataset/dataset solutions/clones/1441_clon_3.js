const fileSystem = require('fs');

const parseSpaceSeparatedNumbers = (inputString) => {
    return inputString.split(' ').map(Number);
};

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const parsedNumbers = parseSpaceSeparatedNumbers(rawInputData);

const triangleSideA = parsedNumbers[0];
const triangleSideB = parsedNumbers[1];
const angleC_degrees = parsedNumbers[2];

const PI_CONSTANT = Math.PI;
const DEG_TO_RAD_FACTOR = PI_CONSTANT / 180;

const angleC_radians = angleC_degrees * DEG_TO_RAD_FACTOR;

const sin_angleC = Math.sin(angleC_radians);
const triangleHeight = triangleSideB * sin_angleC;

const triangleArea = (triangleSideA * triangleHeight) / 2;

const sideA_squared = Math.pow(triangleSideA, 2);
const sideB_squared = Math.pow(triangleSideB, 2);
const cos_angleC = Math.cos(angleC_radians);
const termForSideC = 2 * triangleSideA * triangleSideB * cos_angleC;
const sideCSquaredValue = sideA_squared + sideB_squared - termForSideC;
const triangleSideC = Math.sqrt(sideCSquaredValue);

const trianglePerimeter = triangleSideA + triangleSideB + triangleSideC;

console.log(triangleArea.toFixed(5));
console.log(trianglePerimeter.toFixed(5));
console.log(triangleHeight.toFixed(5));
