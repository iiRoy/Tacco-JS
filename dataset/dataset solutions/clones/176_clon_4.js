function prepareSequenceRegistry() {
    const componentSetA = ["123", "234", "345", "456", "567", "678", "789", "111", "222", "333", "444", "555", "666", "777", "888", "999"];
    const componentSetB = ["11", "22", "33", "44", "55", "66", "77", "88", "99"];

    const registeredSequences = new Set();

    const obtainCanonicalForm = (numericString) => [...numericString].map(Number).sort((first, second) => first - second).join('');

    const generateAllCombinations = (currentSegment, remainingSources) => {
        if (remainingSources.length === 0) {
            registeredSequences.add(obtainCanonicalForm(currentSegment.join('')));
            return;
        }

        const currentSourceArray = remainingSources[0];
        const subsequentSources = remainingSources.slice(1);

        for (const element of currentSourceArray) {
            generateAllCombinations([...currentSegment, element], subsequentSources);
        }
    };

    generateAllCombinations([], [componentSetA, componentSetA, componentSetA, componentSetA, componentSetB]);

    return registeredSequences;
}

const knownPatterns = prepareSequenceRegistry();

const fileSystemInterface = require('fs');
const rawInputContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const inputLines = rawInputContent.trim().split('\n').filter(Boolean);

const evaluateLine = (inputLine) => {
    const initialDigits = [...inputLine].map(Number);

    const qualifyingAppends = Array.from({length: 9}, (_, potentialAppend) => potentialAppend)
        .filter(potentialAppend => {
            const extendedDigits = [...initialDigits, potentialAppend];
            const orderedDigits = extendedDigits.sort((a, b) => a - b);

            const digitOccurrenceCounts = Array(10).fill(0);
            orderedDigits.forEach(digitVal => digitOccurrenceCounts[digitVal]++);

            const highestFrequency = Math.max(...digitOccurrenceCounts);

            if (highestFrequency < 5) {
                const finalSequenceRepresentation = orderedDigits.join('');
                return knownPatterns.has(finalSequenceRepresentation);
            }
            return false;
        });

    return qualifyingAppends.length > 0 ? qualifyingAppends.join(' ') : '0';
};

inputLines.forEach(lineData => {
    console.log(evaluateLine(lineData));
});