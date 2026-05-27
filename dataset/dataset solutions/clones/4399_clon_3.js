function getMissingCharacters (sourceChars, referenceChars) {
    const charPresenceMap = {};
    const finalDifferenceList = [];

    // Mark characters present in the source list
    sourceChars.forEach(charItem => {
        charPresenceMap[charItem] = true;
    });

    // Iterate through the reference list to find differences
    referenceChars.forEach(refCharItem => {
        const isCharPresentInSource = charPresenceMap[refCharItem];
        if (isCharPresentInSource) {
            // If character is in both, remove it from the map
            delete charPresenceMap[refCharItem];
        } else {
            // If character is only in reference, add it to the map
            charPresenceMap[refCharItem] = true;
        }
    });

    // Collect remaining keys from the map, which represent the difference
    for (const keyIdentifier in charPresenceMap) {
        finalDifferenceList.push(keyIdentifier);
    }

    return finalDifferenceList;
}

function processInputString (rawDataString) {
    const inputCharacterArray = rawDataString.split('');
    const fullAlphabetSequence = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // Filter out duplicate characters and sort them
    const distinctInputChars = inputCharacterArray.filter((charElement, charIndex, selfArray) => {
        return selfArray.indexOf(charElement) === charIndex;
    });
    const sortedDistinctChars = distinctInputChars.sort();

    // Calculate the difference between the full alphabet and the input characters
    const firstMissingCharResult = getMissingCharacters(sortedDistinctChars, fullAlphabetSequence);

    // Output the first missing character or 'None'
    if (firstMissingCharResult.length !== 0) {
        console.log(firstMissingCharResult[0]);
    } else {
        console.log('None');
    }
}

processInputString(require('fs').readFileSync('/dev/stdin', 'utf8'));
