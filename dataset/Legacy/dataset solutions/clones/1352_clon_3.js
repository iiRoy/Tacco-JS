const fileSystemModule = require('fs');

const standardInputDescriptor = process.stdin.fd;

const inputStats = fileSystemModule.fstatSync(standardInputDescriptor);
const inputContentSize = inputStats.size;

const readOperationResult = fileSystemModule.readSync(standardInputDescriptor, inputContentSize);

const processedValue = readOperationResult[0];

const finalOutput = processedValue * processedValue * processedValue;

console.log(finalOutput);
