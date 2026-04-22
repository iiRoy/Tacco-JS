"use strict";
const performCalculation = (sourceData) => {
    const componentStrings = sourceData.trim().split(/\s+/);
    const lowerBoundary = parseInt(componentStrings[0], 10);
    const upperBoundary = parseInt(componentStrings[1], 10);
    const commonDivisor = parseInt(componentStrings[2], 10);
    const countUpToUpper = Math.floor(upperBoundary / commonDivisor);
    const countBeforeLower = Math.floor((lowerBoundary - 1) / commonDivisor);
    const totalMultiples = countUpToUpper - countBeforeLower;
    return totalMultiples.toString();
};
(() => {
    const entryData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    const outcome = performCalculation(entryData);
    process.stdout.write(outcome + '\n');
})();