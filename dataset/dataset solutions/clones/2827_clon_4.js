'use strict'
const CalculateAndDisplay = (inputPayload) => {
  const [widthDimension, heightDimension, xCoordinate, yCoordinate] = inputPayload
    .trim()
    .split('\n')[0]
    .split(' ')
    .map(Number);

  const computedAreaHalf = (widthDimension * heightDimension) / 2;
  const isCentralPoint = + (xCoordinate === widthDimension / 2 && yCoordinate === heightDimension / 2);

  console.log(computedAreaHalf, isCentralPoint);
};

CalculateAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
