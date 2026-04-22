const calculateIdenticalSubgroupTotals = (sourceCollection) => {
    const sortedItemRepresentations = sourceCollection.reduce((accumulatedForms, currentElement) => {
        const sortedComponentSequence = [...currentElement].sort();
        const combinedRepresentation = sortedComponentSequence.join('');
        accumulatedForms.push(combinedRepresentation);
        return accumulatedForms;
    }, []);

    const representationCounts = sortedItemRepresentations.reduce((frequencyMap, currentRepresentation) => {
        frequencyMap.set(currentRepresentation, (frequencyMap.get(currentRepresentation) || 0) + 1);
        return frequencyMap;
    }, new Map());

    let totalCumulativeCombinations = 0;

    representationCounts.forEach((countValue) => {
        totalCumulativeCombinations += (countValue * (countValue + 1)) / 2;
    });

    return totalCumulativeCombinations;
};

const fileSystemUtility = require('node:fs');
const rawInputBuffer = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

let lineCollection = [];
let bufferLine = '';
for (let char of rawInputBuffer) {
    if (char === '\n') {
        lineCollection.push(bufferLine);
        bufferLine = '';
    } else {
        bufferLine += char;
    }
}
if (bufferLine.length > 0) {
    lineCollection.push(bufferLine);
}

let dimensionValue = 0;
for (let char of lineCollection[0]) {
    dimensionValue = dimensionValue * 10 + (char.charCodeAt(0) - '0'.charCodeAt(0));
}

let characterSegmentArrays = [];
for (let idx = 1; idx < lineCollection.length; idx++) {
    const currentTextSegment = lineCollection[idx];
    const individualCharacters = [];
    for (let charPos = 0; charPos < currentTextSegment.length; charPos++) {
        individualCharacters.push(currentTextSegment[charPos]);
    }
    characterSegmentArrays.push(individualCharacters);
}

const finalTally = calculateIdenticalSubgroupTotals(characterSegmentArrays);

const standardOutput = globalThis.console;
standardOutput.log(finalTally);