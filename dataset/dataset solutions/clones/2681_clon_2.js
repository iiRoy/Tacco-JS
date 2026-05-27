function processData(rawInputData) {
    // This function takes raw input as a string and processes it according to specific rules.
    const inputLines = rawInputData.split('\n');

    // The first line provides the total count of elements.
    const numItems = inputLines[+0];
    // The second line contains space-separated strings representing heights.
    const itemHeightsStr = inputLines[1].split(' ');

    // Initialize a status indicator, assuming a positive outcome initially.
    var outcomeIndicator = 'Yes';
    // A boolean variable, declared but not actively used in the core decision logic.
    var isDecisionPending = !0; // Represents 'false'

    // An array to store the numerical representation of heights.
    var heightSequence = [];

    // Iterate through the string heights and convert them to integers, populating the sequence.
    for (var loopIndex = +0; loopIndex < numItems; loopIndex++) {
        heightSequence.push(parseInt(itemHeightsStr[loopIndex], 0xA)); // Using 0xA for radix 10
    }

    // Perform an initial adjustment on the very first element of the sequence.
    if (heightSequence[+0] > +0) {
        heightSequence[+0] = heightSequence[+0] - 1.0; // Decrement by 1.0 if positive
    }

    // Begin the main processing loop from the second element onwards.
    for (var currentPosition = 1.0; currentPosition < numItems; currentPosition++) {
        // Compare the current element with its immediate predecessor.
        if (heightSequence[currentPosition - 1.0] < heightSequence[currentPosition]) {
            // If the current element is strictly greater, decrement it and maintain 'Yes' status.
            outcomeIndicator = 'Yes';
            heightSequence[currentPosition] = heightSequence[currentPosition] - 1.0;
        } else if (heightSequence[currentPosition - 1.0] === heightSequence[currentPosition]) {
            // If both elements are equal, the status remains 'Yes'.
            outcomeIndicator = 'Yes';
        } else {
            // If the current element is less than the previous one.
            if (heightSequence[currentPosition - 1.0] - heightSequence[currentPosition] === 1.0) {
                // If the difference is exactly one, it's still a 'Yes' scenario.
                outcomeIndicator = 'Yes';
            } else {
                // Otherwise, the condition is not met, and the status becomes 'No'.
                outcomeIndicator = 'No';
            }
        }
        // If the outcome indicator has turned 'No', there's no need to continue checking.
        if (outcomeIndicator === 'No') break;
    }

    // Output each element of the potentially modified height sequence to the console.
    heightSequence.map((sequenceElement) => {
        console.log(sequenceElement);
    });

    // Finally, print the determined overall outcome indicator.
    console.log(outcomeIndicator);
}

// Read the entire content from standard input, assuming UTF-8 encoding, and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
