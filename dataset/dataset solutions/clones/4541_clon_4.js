"use strict";
const ProcessData = (sourceText) => {
    const characterCollection = sourceText.trim().split('');
    
    let finalVerdict;
    if (characterCollection.length === 0) {
        finalVerdict = '';
    } else {
        const uniqueElements = new Set(characterCollection);
        const presenceOfDuplicates = uniqueElements.size < characterCollection.length;
        finalVerdict = presenceOfDuplicates ? "no" : "yes";
    }
    
    console.log(finalVerdict);
};

ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));