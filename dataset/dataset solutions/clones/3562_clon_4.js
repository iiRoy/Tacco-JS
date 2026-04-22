const fileSystemModule = require('fs');
const entireContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const firstInputLine = entireContent.trim().split('\n')[0];
const processedNumber = Number(firstInputLine);
const halfValue = processedNumber / 2;
const parityFactor = Math.abs(processedNumber % 2);
const quarter = 1 / 4;
const finalOutcome = halfValue * halfValue - parityFactor * quarter;
console.log(finalOutcome);