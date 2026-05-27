const ioSettings = { inputSource: '/dev/stdin', lineSeparator: '\n' };

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync(ioSettings.inputSource, 'ascii');

const inputLines = rawInputContent.split(ioSettings.lineSeparator);

const firstDataLine = inputLines[1];
const secondDataLine = inputLines[2];

const numericVectorOne = firstDataLine.split(' ').map(val => parseFloat(val));
const numericVectorTwo = secondDataLine.split(' ').map(val => parseFloat(val));

let l1Accumulator = 0;
for (let i = 0; i < numericVectorOne.length; i++) {
    l1Accumulator += Math.abs(numericVectorOne[i] - numericVectorTwo[i]);
}
console.log(l1Accumulator);

let l2SquaredSum = 0;
for (let i = 0; i < numericVectorOne.length; i++) {
    const currentDifference = Math.abs(numericVectorOne[i] - numericVectorTwo[i]);
    l2SquaredSum += currentDifference * currentDifference;
}
console.log(Math.sqrt(l2SquaredSum));

let l3CubicSum = 0;
for (let i = 0; i < numericVectorOne.length; i++) {
    const currentDifference = Math.abs(numericVectorOne[i] - numericVectorTwo[i]);
    l3CubicSum += currentDifference * currentDifference * currentDifference;
}
console.log(Math.cbrt(l3CubicSum));

let maxAbsoluteDifference = 0;
for (let i = 0; i < numericVectorOne.length; i++) {
    const currentDifference = Math.abs(numericVectorOne[i] - numericVectorTwo[i]);
    if (currentDifference > maxAbsoluteDifference) {
        maxAbsoluteDifference = currentDifference;
    }
}
console.log(maxAbsoluteDifference);
