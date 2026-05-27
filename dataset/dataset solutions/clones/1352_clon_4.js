const fs = require('fs');

const standardInputDescriptor = process.stdin.fd;
const entireInputContent = fs.readFileSync(standardInputDescriptor, 'utf8');
const initialCharacter = entireInputContent[0];
const numericRepresentation = Number(initialCharacter);
const finalCubicValue = numericRepresentation ** 3;

console.log(finalCubicValue);
