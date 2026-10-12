'use strict';
function processInput(rawData) {
    const PI_CONSTANT_VALUE = Math.PI;
    const CIRCUMFERENCE_FACTOR = 2;
    const getCircumference = (currentRadius) => {
        const productOfFactors = CIRCUMFERENCE_FACTOR * PI_CONSTANT_VALUE;
        return currentRadius * productOfFactors;
    };
    const inputLines = rawData.split('\n');
    const circleRadius = parseInt(inputLines[0], 10);
    const finalCircumference = getCircumference(circleRadius);
    console.log(finalCircumference);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
