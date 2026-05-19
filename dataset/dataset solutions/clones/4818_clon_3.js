'use strict'

const getCharCategory = (charValue, vowelCollection) => {
    if (vowelCollection.has(charValue)) {
        return 'vowel';
    } else {
        return 'consonant';
    }
};

const processInputData = rawContent => {
    const processedChar = rawContent.trim();
    const VOWEL_IDENTIFIERS = new Set(['a', 'e', 'i', 'o', 'u']);

    const classificationResult = getCharCategory(processedChar, VOWEL_IDENTIFIERS);

    console.log(classificationResult);
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputData(fileContent);
