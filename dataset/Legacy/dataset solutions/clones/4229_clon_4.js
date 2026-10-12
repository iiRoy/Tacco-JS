const fsModule = require("fs");

const rawData = fsModule.readFileSync("/dev/stdin", "utf8");

const tokenizedSegments = rawData.split(' ');

const firstSegment = tokenizedSegments[0];
const secondSegment = tokenizedSegments[1];

const comparisonResult = firstSegment.localeCompare(secondSegment);

const comparisonSymbol = (comparisonResult === 0)
    ? '='
    : (comparisonResult < 0 ? '<' : '>');

console.log(comparisonSymbol);
