let    // This function computes the occurrence count for each lowercase English letter within a given string.
    // It returns an array where each index (0-25) corresponds to a letter (a-z) and its value is the count.
    /*
     *  @param {string} sourceText - The input string to analyze.
     *  @returns {Array<number>} An array of 26 integers representing character frequencies.
     */
function    tallyCharacterOccurrences(sourceText)    {
    const      alphaCounts = new Array(26).fill(0); // Initialize an array to store counts for 'a' through 'z'.
    const      charA_Code = "a".charCodeAt(0);   // Get the ASCII/Unicode value for 'a' once.
    let        charIterator;                     // Loop variable for iterating through the input string.

    for (charIterator = 0; charIterator < sourceText.length; charIterator++) {
            // Calculate the 0-based index for the current character (e.g., 'a' -> 0, 'b' -> 1).
        const  computedIndex = sourceText[charIterator].charCodeAt(0) - charA_Code;
            // Increment the count for the corresponding character.
        alphaCounts[computedIndex]++;
    }
    return alphaCounts;
}

    // This routine finds the minimum frequency for each character between two frequency arrays.
    // It effectively computes the intersection of characters available in both sets, by count.
    /*
     *  @param {Array<number>} firstCountsArray - The primary frequency array, which will be modified.
     *  @param {Array<number>} secondCountsArray - The secondary frequency array for comparison.
     *  @returns {Array<number>} The modified firstCountsArray with minimum frequencies.
     */
function    determineCommonCharacterCounts(firstCountsArray, secondCountsArray) {
    let        positionIndex; // Loop counter for iterating through the 26 character positions.

    for (positionIndex = 0; positionIndex < 26; positionIndex++) {
            // Update the count in the first array to be the minimum of the two corresponding counts.
        firstCountsArray[positionIndex] = Math.min(firstCountsArray[positionIndex], secondCountsArray[positionIndex]);
    }
    return firstCountsArray;
}

    // The main entry point for processing the program's input.
    // It reads multiple lines of text, calculates common character frequencies across them,
    // and then prints a string composed of those common characters.
    /*
     *  @param {string} programInputText - The entire input provided to the program, typically from stdin.
     */
function    executeMainProgramLogic(programInputText) {
    const      inputLineSegments = programInputText.split("\n"); // Split the raw input into individual lines.
    const      numberOfStrings = Number.parseInt(inputLineSegments[0], 10); // Parse the first line for the count of strings.
        // Extract the actual strings from the input, skipping the first line.
    const      sourceStringCollection = inputLineSegments.slice(1, numberOfStrings + 1);

        // Calculate initial character frequencies for the very first string.
    let        cumulativeLetterFrequencies = tallyCharacterOccurrences(sourceStringCollection[0]);

    let        stringIterationIndex; // Loop variable for iterating through the collection of strings.
    // Loop through the remaining strings (starting from the second one).
    for (stringIterationIndex = 1; stringIterationIndex < sourceStringCollection.length; stringIterationIndex++) {
            // Get character frequencies for the current string being processed.
        const  currentStringLetterFrequencies = tallyCharacterOccurrences(sourceStringCollection[stringIterationIndex]);
            // Merge the current frequencies with the cumulative ones, keeping only the minimums.
        cumulativeLetterFrequencies = determineCommonCharacterCounts(cumulativeLetterFrequencies, currentStringLetterFrequencies);
    }

    let        outputConstruct = ""; // Initialize an empty string to build the final result.
    let        charSlotIndex;        // Loop variable for iterating through character positions (0-25).

    // Iterate through each character slot (a-z).
    for (charSlotIndex = 0; charSlotIndex < 26; charSlotIndex++) {
        let    occurrenceRepetitionIndex; // Loop variable for repeating a character based on its frequency.
            // For each character, append it to the output string as many times as its final frequency dictates.
        for (occurrenceRepetitionIndex = 0; occurrenceRepetitionIndex < cumulativeLetterFrequencies[charSlotIndex]; occurrenceRepetitionIndex++) {
                // Convert the 0-based index back to a character (e.g., 0 -> 'a', 1 -> 'b').
            outputConstruct += String.fromCharCode(charSlotIndex + "a".charCodeAt(0));
        }
    }
        // Print the final constructed string to the console.
    console.log(outputConstruct);
}

// Invoke the main program logic with input read from standard input.
executeMainProgramLogic(require("fs").readFileSync("/dev/stdin", "utf8"));