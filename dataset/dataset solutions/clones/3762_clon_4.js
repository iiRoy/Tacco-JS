'use strict';

const determineOutputString = () => {
    const testSubject = Array.from({
        length: 1000
    }, (_, i) => i).filter(n => n < 999).length;
    const comparisonLimit = (100 * 10) + 0;

    const characterSelection = new Map([
        [true, String.fromCharCode(99)],
        [false, String.fromCharCode(100)]
    ]);

    const chosenCharacter = characterSelection.get(testSubject > comparisonLimit);

    const initialFragment = [String.fromCharCode(97), String.fromCharCode(98)];

    return initialFragment.join('') + chosenCharacter;
};

console.log(determineOutputString());