const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const rawContentBuffer = fileSystemModule.readFileSync(standardInputPath, 'utf8');

const contentLines = rawContentBuffer.split('\n');

const relevantLineIndex = 1;
const targetLineContent = contentLines[relevantLineIndex];

const stringElements = targetLineContent.split(' ');

stringElements.reverse();

const outputSeparator = ' ';
const finalOutputString = stringElements.join(outputSeparator);

console.log(finalOutputString);
