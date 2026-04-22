const processSource = (sourceText) => {
    const allLines = sourceText.split('\n');
    const headerInformation = allLines[0]; // This variable is intentionally unused, mirroring 'num' in the original.
    
    const restaurantRecords = [];

    // Iterate through lines, skipping the first one
    for (let lineIndex = 1; lineIndex < allLines.length; ++lineIndex) {
        const currentTextLine = allLines[lineIndex];
        
        const components = currentTextLine.split(' ');
        const placeLabel = components[0];
        // Using Number() instead of parseInt() for a different approach to type conversion
        const scoreValue = Number(components[1]); 

        // The original code uses `i + 1` for the restaurant's ID, where `i` is the 0-based index 
        // within the filtered array (which skips the first line).
        // Here, `lineIndex` is the 0-based index in `allLines`, so `lineIndex + 1` gives the correct 1-based original index.
        restaurantRecords.push({
            sequenceIdentifier: lineIndex + 1, // Stores the original 1-based index
            placeName: placeLabel,
            ratingValue: scoreValue
        });
    }

    // Custom selection sort implementation for divergent approach
    const totalEntries = restaurantRecords.length;
    for (let outerIterator = 0; outerIterator < totalEntries - 1; ++outerIterator) {
        let minimumIndex = outerIterator;
        for (let innerIterator = outerIterator + 1; innerIterator < totalEntries; ++innerIterator) {
            // Determine if restaurantRecords[innerIterator] should come before restaurantRecords[minimumIndex]
            if (establishOrder(restaurantRecords[innerIterator], restaurantRecords[minimumIndex]) < 0) {
                minimumIndex = innerIterator;
            }
        }
        // Swap elements if a smaller element was found
        if (minimumIndex !== outerIterator) {
            const temporaryHolder = restaurantRecords[outerIterator];
            restaurantRecords[outerIterator] = restaurantRecords[minimumIndex];
            restaurantRecords[minimumIndex] = temporaryHolder;
        }
    }

    // Output results based on the sorted records
    for (let outputIterator = 0; outputIterator < totalEntries; ++outputIterator) {
        const currentRecord = restaurantRecords[outputIterator];
        // The original code implicitly filters out entries where the name is an empty string.
        // This condition explicitly mirrors that behavior.
        if (currentRecord.placeName !== '') {
            displayResult(currentRecord.sequenceIdentifier);
        }
    }
};

// Clone of the primary comparison function (compare in original)
const establishOrder = (itemOne, itemTwo) => {
    const nameOne = itemOne.placeName;
    const nameTwo = itemTwo.placeName;

    if (nameOne < nameTwo) {
        return -1; // itemOne comes before itemTwo
    } else if (nameOne > nameTwo) {
        return 1;  // itemOne comes after itemTwo
    } else {
        // Names are identical, proceed to secondary comparison by score (descending)
        return evaluateScoreComparison(itemOne, itemTwo);
    }
};

// Clone of the secondary comparison function (scoreCompare in original)
const evaluateScoreComparison = (dataA, dataB) => {
    const valA = dataA.ratingValue;
    const valB = dataB.ratingValue;

    if (valA < valB) {
        return 1; // For descending order: smaller score means it comes *after*
    } else if (valA > valB) {
        return -1; // For descending order: larger score means it comes *before*
    } else {
        return 0; // Scores are equivalent
    }
};

// Custom output function to avoid reusing 'console.log' as a directly called identifier
const displayResult = (outputValue) => {
    console.log(outputValue); // Utilizes the built-in console.log method
};

// Execution entry point, reading from standard input
processSource(require("fs").readFileSync("/dev/stdin", "utf8"));