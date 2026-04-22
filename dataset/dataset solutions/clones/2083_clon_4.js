'use strict';

const acquireInitialSection = (entireStream) => {
    let accumulatedCharacters = '';
    for (let currentPosition = 0; currentPosition < entireStream.length; currentPosition++) {
        if (entireStream[currentPosition] === '\n') {
            break;
        }
        accumulatedCharacters += entireStream[currentPosition];
    }
    return accumulatedCharacters;
};

const ascertainPairPresence = (subjectString, firstChar, secondChar) => {
    if (subjectString.length < 2) {
        return false;
    }
    if (subjectString[0] === firstChar && subjectString[1] === secondChar) {
        return true;
    }
    return ascertainPairPresence(subjectString.substring(1), firstChar, secondChar);
};

const runVerification = (inputContent) => {
    const primarySegment = acquireInitialSection(inputContent);
    const hasDesiredPattern = ascertainPairPresence(primarySegment, 'h', 'i');

    const outcomeMap = {
        true: 'Yes',
        false: 'No'
    };
    console.log(outcomeMap[hasDesiredPattern]);
};

runVerification(require('node:fs').readFileSync('/dev/stdin', 'utf8'));