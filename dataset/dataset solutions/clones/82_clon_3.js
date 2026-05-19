const fileSystemHandler = require('fs');
const inputFilePath = '/dev/stdin';

let fileContentRaw = fileSystemHandler.readFileSync(inputFilePath, 'utf8');

let trimmedContent = fileContentRaw.trim();

let finalOutputString = trimmedContent.toUpperCase();

console.log(finalOutputString);
