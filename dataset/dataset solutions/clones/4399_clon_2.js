function processInputData(sourceText) {
    let inputCharacters = sourceText.split('');

    let standardLetters = 'abcdefghijklmnopqrstuvwxyz'.split(''); // Define the complete alphabet sequence

    // Extract unique characters from the input and arrange them in alphabetical order.
    let distinctElements = inputCharacters.filter(function (currentItem, positionIndex, entireArray) {
        return entireArray.indexOf(currentItem) === positionIndex;
    })
        .sort();

    let resultDifference = determineMissingComponents(distinctElements, standardLetters);
    // Find the elements that are present in the reference set but absent from the processed input.
    function determineMissingComponents(sourceCollection, comparisonCollection) {
        let presenceTracker = {};
        let missingItemsList = [];

        // Populate a tracker with all elements from the initial source collection.
        for (let itemIndex = 0; itemIndex < sourceCollection.length; itemIndex++) {
            presenceTracker[sourceCollection[itemIndex]] = true;
        }

        // Iterate through the comparison collection.
        // If an element is found in the tracker, it means it was in the source and should be ignored.
        // If it's not found, it's a 'missing' element from the source, so mark it.
        for (let charIdx = 0; charIdx < comparisonCollection.length; charIdx++) {
            if (presenceTracker[comparisonCollection[charIdx]]) {
                delete presenceTracker[comparisonCollection[charIdx]];
            } else {
                presenceTracker[comparisonCollection[charIdx]] = true;
            }
        }

        // Collect all remaining keys in the tracker, which now represent the actual missing items.
        for (let elementKey in presenceTracker) {
            missingItemsList.push(elementKey);
        }
        return missingItemsList;
    }

    if (resultDifference.length !== 0) {
        console.log(resultDifference[0]);
    } else {
        console.log('None');
    }
}
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));