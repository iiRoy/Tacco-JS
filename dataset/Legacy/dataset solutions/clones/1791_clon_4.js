const fs = require("fs");
const rawInputData = fs.readFileSync("/dev/stdin", "utf8");

let numericTokens = rawInputData.match(/\S+/g);

const extractNextInteger = () => parseInt(numericTokens.shift());

const startPointAlpha = extractNextInteger();
const velocityAlpha = extractNextInteger();
const startPointBeta = extractNextInteger();
const velocityBeta = extractNextInteger();
const elapsedDuration = extractNextInteger();

const outcomeMessage = (elapsedDuration === 0)
    ? 'NO'
    : (startPointAlpha + velocityAlpha * elapsedDuration >= startPointBeta + velocityBeta * elapsedDuration ? 'YES' : 'NO');

console.log(outcomeMessage);
