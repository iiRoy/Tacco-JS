const parseInteger = (numericString) => {
    // Ensures proper base-10 parsing for numerical strings.
    return parseInt(numericString, 10);
};

function ProcessInputData(rawDataString) {
    // Deconstruct the input string into individual lines for easier processing.
    const allInputLines = rawDataString.split('\n');

    // The first line contains the grid dimensions (Height and Width).
    const dimensionTokens = allInputLines[0].split(' ');
    const gridHeight = parseInteger(dimensionTokens[0]);
    const gridWidth = parseInteger(dimensionTokens[1]);

    // Specific edge case: If the grid is only one unit wide, it can always form a palindrome.
    // This is an early exit condition.
    if (gridWidth === 1) {
        return console.log('Yes');
    }

    // Initialize an object to store the frequency of each character in the grid.
    const characterOccurrenceMap = {};

    // Concatenate all grid rows (from the second line onwards) into a single string
    // and then iterate over each character to build the frequency map.
    const allGridCharacters = allInputLines.slice(1).join('');
    for (let charIdx = 0; charIdx < allGridCharacters.length; charIdx++) {
        const currentCharacter = allGridCharacters[charIdx];
        // Increment the count for the current character. If it's new, initialize to 0 first.
        characterOccurrenceMap[currentCharacter] = (characterOccurrenceMap[currentCharacter] || 0) + 1;
    }

    // Helper function to identify characters whose counts are not multiples of 4.
    // This logic is reused across different dimension parity cases.
    const findCharactersWithNonQuadrupleCounts = () => {
        return Object.keys(characterOccurrenceMap).filter(charKey => {
            // Return true if the character's frequency is not perfectly divisible by 4.
            return characterOccurrenceMap[charKey] % 4 !== 0;
        });
    };

    // --- Palindrome Check Logic based on Grid Dimensions Parity ---

    // Scenario 1: Both grid dimensions (Height and Width) are even.
    // For an even x even grid to be a palindrome, all character counts must be multiples of 4.
    if (gridHeight % 2 === 0 && gridWidth % 2 === 0) {
        const charsNotMultipleOfFour = findCharactersWithNonQuadrupleCounts();
        const numSuchChars = charsNotMultipleOfFour.length;

        // If no characters have counts that are not multiples of 4, then it's a 'Yes'.
        if (numSuchChars === 0) {
            return console.log('Yes');
        } else {
            // Otherwise, it's a 'No'.
            return console.log('No');
        }
    }

    // Scenario 2: Both grid dimensions (Height and Width) are odd.
    // For an odd x odd grid, at most one character can have an odd count.
    // The sum of counts of characters whose frequencies are not multiples of 4 must be odd.
    // This implies that exactly one character has an odd frequency (not a multiple of 4),
    // and any other non-quadruple counts are even (like 2, 6, 10...).
    if (gridHeight % 2 !== 0 && gridWidth % 2 !== 0) {
        const relevantChars = findCharactersWithNonQuadrupleCounts();
        let cumulativeFrequencySum = 0;

        // Iterate through the identified characters and sum their frequencies.
        for (let idx = 0; idx < relevantChars.length; idx++) {
            const currentKey = relevantChars[idx];
            cumulativeFrequencySum += characterOccurrenceMap[currentKey];
        }

        // If the total sum is odd, it satisfies the condition for an odd x odd palindrome.
        if (cumulativeFrequencySum % 2 === 1) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    // Scenario 3: One dimension is odd, and the other is even.
    // This is the remaining case after checking the previous two parity combinations.
    // According to the original problem logic, for this mixed-parity case,
    // all character counts must be multiples of 4.
    // We calculate the sum of frequencies that are not multiples of 4.
    const totalNonQuadrupleFrequencySum = findCharactersWithNonQuadrupleCounts().reduce((currentAccumulator, charIdentifier) => {
        // Ensure the value is parsed as an integer before adding, for robustness.
        return currentAccumulator + parseInteger(characterOccurrenceMap[charIdentifier]);
    }, 0); // Start the sum from zero.

    // If this sum is zero, it means all character counts were multiples of 4.
    if (totalNonQuadrupleFrequencySum === 0) {
        return console.log('Yes');
    } else {
        return console.log('No');
    }
}

// Entry point: Read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));