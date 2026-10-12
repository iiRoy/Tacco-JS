const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const outputPrefix = 'ABC';

let rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
let firstLineOfString = rawInputContent.split('\n')[0];
let inputNumericValue = Number(firstLineOfString);

console.log(outputPrefix + inputNumericValue);
