const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileData.split('\n');

const [valNStr, valAStr, valBStr] = dataLines;

const valN = parseInt(valNStr, 10);
const valA = parseInt(valAStr, 10);
const valB = parseInt(valBStr, 10);

const resultGenerator = new Map([
    [true, () => 'Hello World'],
    [false, (a, b) => a + b]
]);

const outputValue = resultGenerator.get(valN === 1)(valA, valB);

console.log(outputValue);
