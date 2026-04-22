function processInputData(incomingData) {
    // This function processes a given string input to count character alternations.

    // Split the entire input string by newline characters into an array of individual lines.
    const dataLines = incomingData.split("\n");


    // Extract the very first line from the array and remove any leading or trailing whitespace.
    let targetSequence = dataLines[0].trim();

    // Initialize a variable to hold the character encountered in the previous iteration.
    // Start with the first character of the processed sequence.
    let lastEncounteredChar = targetSequence[0];

    // Initialize a counter to keep track of how many times the character alternates.
    let alternationCount = 0;

    // Loop through the target sequence, starting from the second character (index 1).
    for (let charPosition = 1; charPosition < targetSequence.length; charPosition++) {

        // Check if the character at the current position is different from the last encountered character.
        if (lastEncounteredChar !== targetSequence[charPosition]) {
            // If they are different, it means an alternation has occurred, so increment the counter.
            alternationCount++;
        }
        // Update the 'lastEncounteredChar' to the character at the current position for the next iteration.
        lastEncounteredChar = targetSequence[charPosition];
    }

    // Output the final calculated count of alternations to the console.
    console.log(alternationCount);
}


// The following section is for standard input/output handling and should not be altered.
// It reads all data from standard input and passes it to the primary processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));