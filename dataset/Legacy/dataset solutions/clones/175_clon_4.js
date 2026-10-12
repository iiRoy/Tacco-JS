function createPuzzleData() {
    const dataStore = new Set();

    const sourceABElements = Array.from({ length: 7 }, (_, idx) => [idx, idx + 1, idx + 2])
                             .concat(Array.from({ length: 9 }, (_, idx) => [idx, idx, idx]));
    const sourceCElements = Array.from({ length: 9 }, (_, idx) => [idx, idx]);

    function generateCombinationsRecursive(currentDigitsAccumulator, currentDepth) {
        if (currentDepth === 4) {
            for (let cElementIndex = 0; cElementIndex < sourceCElements.length; cElementIndex++) {
                const finalDigitSequence = [...currentDigitsAccumulator, ...sourceCElements[cElementIndex]];
                finalDigitSequence.sort((a, b) => a - b);
                dataStore.add(finalDigitSequence.join(''));
            }
            return;
        }

        for (let abElementIndex = 0; abElementIndex < sourceABElements.length; abElementIndex++) {
            generateCombinationsRecursive([...currentDigitsAccumulator, ...sourceABElements[abElementIndex]], currentDepth + 1);
        }
    }

    generateCombinationsRecursive([], 0);

    const puzzleLookupObject = {};
    dataStore.forEach(key => {
        puzzleLookupObject[key] = true;
    });
    return puzzleLookupObject;
}

const puzzleLookup = createPuzzleData();

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

inputLines.map(currentInputString => {
    const validAppendedValues = Array.from({ length: 9 }, (_, digitToAppend) => {
        const initialDigitsArray = currentInputString.split('').map(Number);
        const adjustedDigitsArray = initialDigitsArray.map(val => val - 1);
        const candidateDigitsArray = [...adjustedDigitsArray, digitToAppend];

        candidateDigitsArray.sort((a, b) => a - b);

        const digitFrequencyMap = candidateDigitsArray.reduce((accumulator, digit) => {
            accumulator[digit] = (accumulator[digit] || 0) + 1;
            return accumulator;
        }, {});

        const highestFrequency = Object.values(digitFrequencyMap).reduce((maxVal, count) => Math.max(maxVal, count), 0);

        if (highestFrequency >= 5) {
            return null;
        }

        if (puzzleLookup.hasOwnProperty(candidateDigitsArray.join(''))) {
            return digitToAppend + 1;
        } else {
            return null;
        }
    })
    .filter(resultItem => resultItem !== null);

    console.log(validAppendedValues.length === 0 ? '0' : validAppendedValues.join(' '));
});
