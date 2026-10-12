const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

const numericComponents = rawInput.split(/\s+/).filter(Boolean).map(parseFloat);

const [coordX1, coordY1, coordX2, coordY2] = numericComponents;

const calculateSquare = (value) => value * value;

const xDifference = coordX2 - coordX1;
const yDifference = coordY2 - coordY1;

const squaredXDiff = calculateSquare(xDifference);
const squaredYDiff = calculateSquare(yDifference);

const sumOfSquares = squaredXDiff + squaredYDiff;

const resultantDistance = Math.sqrt(sumOfSquares);

console.log(resultantDistance.toFixed(8));
