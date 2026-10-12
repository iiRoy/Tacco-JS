const fileSystemModule = require('fs');
const inputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(inputPath, encodingType);
const inputStringParts = rawInputContent.split(' ');

const [dividendVal, divisorVal] = inputStringParts.map(BigInt);

const integerDivisionResultBigInt = dividendVal / divisorVal;
const remainderResultBigInt = dividendVal % divisorVal;

// The original Math.floor(a/b) implies BigInt division first, then conversion to Number, then floor.
// For integer results, Math.floor(Number(BigInt_integer)) is equivalent to Number(BigInt_integer).
const flooredNumberRepresentation = Math.floor(Number(integerDivisionResultBigInt));

console.log(flooredNumberRepresentation, remainderResultBigInt, integerDivisionResultBigInt);
