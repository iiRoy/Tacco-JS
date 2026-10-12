const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const stringValues = rawData.split(' ');

const accumulatedTotal = stringValues.reduce((currentSum, currentStringValue) => {
    const numericValue = Number(currentStringValue);
    return currentSum + numericValue;
}, 0);

const valueCount = stringValues.length;

const rawAverage = accumulatedTotal / valueCount;
const finalResult = Math.ceil(rawAverage);

console.log(finalResult);
