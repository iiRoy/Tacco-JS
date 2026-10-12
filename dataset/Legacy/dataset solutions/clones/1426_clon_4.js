const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputSegments = rawInputContent.split('\n');

const characterTally = inputSegments
    .flatMap(segment => Array.from(segment))
    .filter(unit => {
        const normalizedUnit = unit.toLowerCase();
        return normalizedUnit >= 'a' && normalizedUnit <= 'z';
    })
    .reduce((accumulatorMap, validUnit) => {
        const keyChar = validUnit.toLowerCase();
        accumulatorMap.set(keyChar, (accumulatorMap.get(keyChar) || 0) + 1);
        return accumulatorMap;
    }, new Map());

const initialCharCode = 'a'.charCodeAt(0);
const alphabetSequence = Array.from({ length: 26 }, (_, index) =>
    String.fromCharCode(initialCharCode + index)
);

alphabetSequence.forEach(letterKey => {
    const occurrenceCount = characterTally.get(letterKey) || 0;
    console.log(`${letterKey} : ${occurrenceCount}`);
});
