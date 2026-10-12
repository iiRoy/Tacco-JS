function processInputData(sourceData) {
    const TARGET_CHARACTER = '?';
    const REPLACEMENT_CHARACTER = 'D';

    let characterSequence = sourceData.split('');
    let foundIndex;

    // Continuously search for and replace the target character
    // until no more occurrences are found.
    do {
        foundIndex = characterSequence.indexOf(TARGET_CHARACTER);
        if (foundIndex !== -1) {
            characterSequence[foundIndex] = REPLACEMENT_CHARACTER;
        }
    } while (foundIndex !== -1);

    // Reconstruct the string from the modified character array.
    const finalOutputString = characterSequence.join('');

    // Display the resulting string.
    console.log(finalOutputString);
}

// Execute the main processing function with input read from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
