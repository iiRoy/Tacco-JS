const fileSystemModule = require('fs');
const sourceFilePath = '/dev/stdin';
const characterEncoding = 'utf8';
const wordDelimiter = ' ';
const fullInputString = fileSystemModule.readFileSync(sourceFilePath, characterEncoding);
const resultantStringArray = fullInputString.split(wordDelimiter);
console.log(resultantStringArray);
