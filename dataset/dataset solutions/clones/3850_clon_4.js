'use strict';

function processCollection(collection) {
    let largestVal = -Infinity;
    let largestIdx = -1;

    collection.forEach((item, idx) => {
        if (item > largestVal) {
            largestVal = item;
            largestIdx = idx;
        }
    });

    return collection.map((item, idx) =>
        idx === largestIdx ? item * 2 : item
    );
}

function acquireData(sourceContent) {
    const contentLines = sourceContent.split('\n');
    const numericSequenceString = contentLines[0];
    const iterationCountString = contentLines[1];

    const initialNumbers = numericSequenceString.match(/\d+/g).map(Number);
    const operationCount = Number(iterationCountString);

    return { initialNumbers: initialNumbers, operationCount: operationCount };
}

function sumElements(collection) {
    let aggregate = 0;
    for (const element of collection) {
        aggregate += element;
    }
    return aggregate;
}

function executor(sourceContent) {
    const dataBundle = acquireData(sourceContent);
    const initialNumericArray = dataBundle.initialNumbers;
    const numberOfOperations = dataBundle.operationCount;

    const transformedCollection = Array.from({ length: numberOfOperations }).reduce((currentArrayState, _, __) => {
        return processCollection(currentArrayState);
    }, initialNumericArray);

    console.log(sumElements(transformedCollection));
}

executor(require('fs').readFileSync('/dev/stdin', 'utf8'));