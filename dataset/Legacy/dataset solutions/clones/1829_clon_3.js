const fileSystem = require('fs');
const sourcePath = '/dev/stdin';
const encodingType = 'utf8';

const rawInputContent = fileSystem.readFileSync(sourcePath, encodingType);
const processedLines = rawInputContent.split('\n');

const targetString = processedLines[0];

const firstReplacementPattern = new RegExp('[?|P][?|D]', 'g');
const secondReplacementPattern = new RegExp('\\?', 'g');

const stringAfterFirstPass = targetString.replace(firstReplacementPattern, 'PD');
const finalProcessedString = stringAfterFirstPass.replace(secondReplacementPattern, 'D');

console.log(finalProcessedString);
