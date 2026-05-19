'use strict';
(function(inputSource) {
    const rawContent = inputSource.toString();
    const firstLine = rawContent.split('\n')[0];
    const stringTokens = firstLine.split(' ');

    const numericalCollection = [];
    for (let k = 0; k < stringTokens.length; k++) {
        numericalCollection.push(Number(stringTokens[k]));
    }

    // Implementation of Insertion Sort algorithm
    const collectionLength = numericalCollection.length;
    const orderedCollection = [...numericalCollection]; // Create a shallow copy to sort

    for (let outerIndex = 1; outerIndex < collectionLength; outerIndex++) {
        let currentItem = orderedCollection[outerIndex];
        let innerIndex = outerIndex - 1;
        while (innerIndex >= 0 && orderedCollection[innerIndex] > currentItem) {
            orderedCollection[innerIndex + 1] = orderedCollection[innerIndex];
            innerIndex--;
        }
        orderedCollection[innerIndex + 1] = currentItem;
    }

    const finalRepresentation = orderedCollection.join(' ');
    console.log(finalRepresentation);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
