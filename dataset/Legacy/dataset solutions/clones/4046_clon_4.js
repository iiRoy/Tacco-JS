const inputSource = require("fs");
const rawInputData = inputSource.readFileSync("/dev/stdin", "utf8");

const lineSegments = rawInputData.split('\n');

const firstValue = Number(lineSegments[0]);
const secondValue = Number(lineSegments[1]);
const thirdValue = Number(lineSegments[2]);

const interimDifference = firstValue - secondValue;
const computedRemainder = interimDifference - thirdValue * Math.trunc(interimDifference / thirdValue);

console.log(computedRemainder);
