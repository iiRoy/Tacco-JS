'use strict';

const acquireDataFromPath = (pathSpecifier, characterEncoding) => {
    const fileOperationsModule = require('fs');
    return fileOperationsModule.readFileSync(pathSpecifier, characterEncoding);
};

const performComputation = (incomingRawText) => {
    const stringRepresentations = incomingRawText.match(/\d+/g);
    if (!stringRepresentations || stringRepresentations.length < 3) {
        return;
    }

    const numericCollection = [];
    for (const numStr of stringRepresentations) {
        numericCollection.push(parseInt(numStr, 10));
    }

    const sortedNumericalSequence = [...numericCollection];
    const countOfElements = sortedNumericalSequence.length;

    for (let outerPosition = 0; outerPosition < countOfElements - 1; outerPosition++) {
        for (let innerPosition = 0; innerPosition < countOfElements - 1 - outerPosition; innerPosition++) {
            if (sortedNumericalSequence[innerPosition] > sortedNumericalSequence[innerPosition + 1]) {
                const temporaryHolder = sortedNumericalSequence[innerPosition];
                sortedNumericalSequence[innerPosition] = sortedNumericalSequence[innerPosition + 1];
                sortedNumericalSequence[innerPosition + 1] = temporaryHolder;
            }
        }
    }

    const deliverOutput = (contentToDisplay) => {
        console.log(contentToDisplay);
    };

    deliverOutput(sortedNumericalSequence);

    const elementOne = sortedNumericalSequence[0];
    const elementTwo = sortedNumericalSequence[1];
    const elementThree = sortedNumericalSequence[2];

    if (elementThree === elementOne + elementTwo) {
        deliverOutput('Yes');
    } else {
        deliverOutput('No');
    }
};

const obtainedTextData = acquireDataFromPath('/dev/stdin', 'utf8');
performComputation(obtainedTextData);