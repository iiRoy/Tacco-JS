function getCartesianProduct(...collections) {
    return collections.reduce((accumulator, currentCollection) => {
        const newCombinations = [];
        accumulator.forEach(existingCombo => {
            currentCollection.forEach(currentItem => {
                newCombinations.push([...existingCombo, currentItem]);
            });
        });
        return newCombinations;
    }, [[]]);
}

function produceValidDigitSequences() {
    const mainSegments = ["123", "234", "345", "456", "567", "678", "789", "111", "222", "333", "444", "555", "666", "777", "888", "999"];
    const auxiliarySegments = ["11", "22", "33", "44", "55", "66", "77", "88", "99"];

    const sequenceSet = new Set();

    const allSegmentCombinations = getCartesianProduct(
        mainSegments,
        mainSegments,
        mainSegments,
        mainSegments,
        auxiliarySegments
    );

    allSegmentCombinations.forEach(segmentsArray => {
        const concatenatedDigits = segmentsArray.join('');
        const processedDigits = concatenatedDigits
            .split('')
            .map(Number)
            .sort((valA, valB) => valA - valB)
            .join('');
        sequenceSet.add(processedDigits);
    });

    return sequenceSet;
}

const permittedSequences = produceValidDigitSequences();
const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = sourceContent.trim().split('\n');

const outputResults = processedLines.map(currentEntry => {
    const candidateDigits = Array.from({ length: 9 }, (_, index) => index + 1); // Generates [1, 2, ..., 9]

    const foundSuffixes = candidateDigits.filter(potentialSuffix => {
        const currentDigitArray = currentEntry
            .split('')
            .map(Number);
        currentDigitArray.push(potentialSuffix);
        currentDigitArray.sort((valA, valB) => valA - valB);

        const digitOccurrences = new Map();
        currentDigitArray.forEach(digit => {
            digitOccurrences.set(digit, (digitOccurrences.get(digit) || 0) + 1);
        });

        const maximumOccurrence = Math.max(...Array.from(digitOccurrences.values()));

        if (maximumOccurrence >= 5) {
            return false; // Exclude if any digit appears 5 or more times
        }

        return permittedSequences.has(currentDigitArray.join(''));
    });

    return foundSuffixes.length > 0 ? foundSuffixes.join(' ') : '0';
});

outputResults.forEach(resultLine => console.log(resultLine));