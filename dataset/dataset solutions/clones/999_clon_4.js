process.stdin.resume();
process.stdin.setEncoding('utf8');
let rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');

let processedData = rawInput.trim().split('\n').map(Number);

let firstElement = processedData[0];
let dataSequence = processedData.slice(1);

let outerIterationLimit = Math.min(dataSequence.length, firstElement - 1);

let allCalculatedDifferences = Array.from({ length: outerIterationLimit }, (_, indexA) => indexA)
    .flatMap(indexA => {
        return Array.from({ length: dataSequence.length }, (_, indexB) => indexB)
            .filter(indexB => indexA !== indexB)
            .map(indexB => dataSequence[indexA] - dataSequence[indexB]);
    });

let finalResult = allCalculatedDifferences.reduce((currentMaximum, differenceValue) => Math.max(currentMaximum, differenceValue), 0);

console.log(finalResult);
