const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputSegments = rawInputContent.split('\n');

const configurationDetails = inputSegments[0].split(' ');
const subsetCardinality = parseInt(configurationDetails[1], 10);

const numericalSequence = inputSegments.slice(1)
                                        .map(entry => Number(entry))
                                        .sort((valA, valB) => valA - valB);

let resultantDifference;

if (numericalSequence.length < subsetCardinality) {
    resultantDifference = -1;
} else {
    const potentialDifferences = Array.from({ length: numericalSequence.length - subsetCardinality + 1 }, (_, position) => {
        const initialElement = numericalSequence[position];
        const finalElement = numericalSequence[position + subsetCardinality - 1];
        return finalElement - initialElement;
    });
    resultantDifference = Math.min(...potentialDifferences);
}

console.log(resultantDifference);
