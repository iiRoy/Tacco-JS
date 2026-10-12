const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';
const lineDelimiter = '\n';
const firstLineIndex = 0;
const commaPattern = /,/g;
const spaceReplacement = ' ';

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
const contentLines = rawFileContent.split(lineDelimiter);
const firstRelevantLine = contentLines[firstLineIndex];

const modifiedLine = firstRelevantLine.replace(commaPattern, spaceReplacement);

console.log(modifiedLine);
