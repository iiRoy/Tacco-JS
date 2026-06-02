function processInput(rawData) {
    // Split the incoming data string into an array of individual characters.
    const charArray = rawData.split('');

    // Initialize a variable to hold the complete lowercase English alphabet.
    var fullAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // Filter the character array to remove any duplicate entries, then sort the unique characters alphabetically.
    var uniqueChars = charArray.filter(function (currentItem, currentIndex, sourceArray) {
        return sourceArray.indexOf(currentItem) === currentIndex;
    }).sort();

    // Compute the symmetric difference between the unique characters and the full alphabet.
    var resultantDiff = calculateDifference(uniqueChars, fullAlphabet);

    // This nested function determines the symmetric difference between two character sets.
    function calculateDifference(firstSet, secondSet) {
        var tempMap = []; // A temporary structure to track elements.
        var differenceResult = []; // Stores the final difference.

        // Populate the temporary map with elements from the first set.
        // Each character from the first set becomes a key with a 'true' value.
        for (var idx = 0; idx < firstSet.length; idx++) {
            tempMap[firstSet[idx]] = true;
        }

        // Iterate through the second set to find common and unique elements.
        // If an element from the second set is found in tempMap, it's common, so remove it.
        // Otherwise, it's unique to the second set, so add it to tempMap.
        for (var idx = 0; idx < secondSet.length; idx++) {
            if (tempMap[secondSet[idx]]) {
                delete tempMap[secondSet[idx]];
            } else {
                tempMap[secondSet[idx]] = true;
            }
        }

        // Collect all remaining keys from the temporary map into the result array.
        // These keys represent the symmetric difference.
        for (var keyVal in tempMap) {
            differenceResult.push(keyVal);
        }
        return differenceResult;
    }

    // Check if any difference was found.
    // If there are differing characters, print the first one.
    // Otherwise, print 'None'.
    if (resultantDiff.length !== 0) {
        console.log(resultantDiff[0]);
    } else {
        console.log('None');
    }
}

// Read input from the standard input stream and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
