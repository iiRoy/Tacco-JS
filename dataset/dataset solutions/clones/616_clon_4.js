const fs = require('fs');

let sourceData = fs.readFileSync('/dev/stdin', 'utf8');
let processedLines = sourceData.trim().split("\n");

let initialValue = processedLines.shift() - 0;

let combinedNumericValues = Array.from({ length: 5 }, (_, firstIndex) => firstIndex)
    .flatMap(firstIndex =>
        Array.from({ length: 5 }, (_, secondIndex) => secondIndex)
            .filter(secondIndex => firstIndex < secondIndex)
            .flatMap(secondIndex => [
                (processedLines[firstIndex] + processedLines[secondIndex]) - 0,
                (processedLines[secondIndex] + processedLines[firstIndex]) - 0
            ])
    );

combinedNumericValues.sort((valA, valB) => valA - valB);

console.log(combinedNumericValues[2]);
