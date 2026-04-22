const nodeFileSystem = require('node:fs');

const rawInputContent = nodeFileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputContent.trim().split('\n');

const primeNumericSet = new Set(processedLines[1].split(' ').map(Number));

const targetNumericArray = processedLines[3].split(' ').map(Number);

const countOfPresentElements = targetNumericArray.filter(
  (candidateNumber) => primeNumericSet.has(candidateNumber)
).length;

console.log(countOfPresentElements);