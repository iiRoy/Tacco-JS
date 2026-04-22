const dataRegistry = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = dataRegistry.trim().split('\n');
let linePosition = 0;

let currentBlockSize = Number.parseInt(processedLines[linePosition++], 10);

while (currentBlockSize !== 0) {
    const numberCollection = processedLines[linePosition++].split(' ').map(item => Number(item));

    let minimumGap = Infinity;

    for (let primaryIndex = 0; primaryIndex < numberCollection.length; ++primaryIndex) {
        for (let secondaryIndex = primaryIndex + 1; secondaryIndex < numberCollection.length; ++secondaryIndex) {
            const calculatedDifference = Math.abs(numberCollection[primaryIndex] - numberCollection[secondaryIndex]);
            if (calculatedDifference < minimumGap) {
                minimumGap = calculatedDifference;
            }
        }
    }
    console.log(minimumGap);

    currentBlockSize = Number.parseInt(processedLines[linePosition++], 10);
}