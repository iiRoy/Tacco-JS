const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputData.trim().split('\n');
const elementCount = parseInt(processedLines.shift(), 10);

const combinedValues = Array.from({ length: elementCount }, (_, firstIndex) =>
    Array.from({ length: elementCount - (firstIndex + 1) }, (_, offset) => {
        const secondIndex = firstIndex + 1 + offset;
        const stringA = processedLines[firstIndex];
        const stringB = processedLines[secondIndex];
        return [
            Number(stringA + stringB),
            Number(stringB + stringA)
        ];
    })
).flat(2);

combinedValues.sort((valX, valY) => valX - valY);

console.log(combinedValues[2]);
