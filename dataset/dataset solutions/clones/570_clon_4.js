const systemIO = require('node:fs');
const acquiredData = systemIO.readFileSync('/dev/stdin', 'utf8');
const processedData = acquiredData.trim();

const patternOne = /JOI/g;
const patternTwo = /IOI/g;

const matchesOne = processedData.match(patternOne);
const matchesTwo = processedData.match(patternTwo);

const tallyOne = matchesOne ? matchesOne.length : 0;
const tallyTwo = matchesTwo ? matchesTwo.length : 0;

console.log(tallyOne);
console.log(tallyTwo);