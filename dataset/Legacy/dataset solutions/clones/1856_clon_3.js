"use strict";

const DEGREES_PER_HOUR_UNIT = 30;
const DEGREES_PER_MINUTE_FOR_HOUR_HAND = 0.5;
const DEGREES_PER_MINUTE_FOR_MINUTE_HAND = 6;
const DEGREES_TO_RADIANS_CONVERSION_FACTOR = Math.PI / 180;

const parseNumericLine = (lineString) => {
    return lineString.split(' ').map(Number);
};

const computeDistanceSquared = (side1, side2, angleInDegrees) => {
    const angleInRadians = angleInDegrees * DEGREES_TO_RADIANS_CONVERSION_FACTOR;
    const cosineOfAngle = Math.cos(angleInRadians);
    return side1 * side1 + side2 * side2 - 2 * side1 * side2 * cosineOfAngle;
};

const solveClockProblem = (rawData) => {
    const inputLines = rawData.split('\n');
    const [lenA, lenB, hours, minutes] = parseNumericLine(inputLines[0]);

    const hourHandAngle = (hours % 12) * DEGREES_PER_HOUR_UNIT + minutes * DEGREES_PER_MINUTE_FOR_HOUR_HAND;
    const minuteHandAngle = minutes * DEGREES_PER_MINUTE_FOR_MINUTE_HAND;

    const rawAngleDifference = Math.abs(hourHandAngle - minuteHandAngle);
    const effectiveAngleBetweenHands = Math.min(rawAngleDifference, 360 - rawAngleDifference);

    const squaredDistance = computeDistanceSquared(lenA, lenB, effectiveAngleBetweenHands);

    console.log(Math.sqrt(squaredDistance));
};

solveClockProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
