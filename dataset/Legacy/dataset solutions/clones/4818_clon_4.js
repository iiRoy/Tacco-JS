'use strict';

const processCharacterInput = sourceData => {
    const singleChar = sourceData.trim();
    let classificationResult;

    switch (singleChar) {
        case 'a':
        case 'e':
        case 'i':
        case 'o':
        case 'u':
            classificationResult = 'vowel';
            break;
        default:
            classificationResult = 'consonant';
    }

    console.log(classificationResult);
};

processCharacterInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
