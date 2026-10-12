function ProcessInput(sourceText) {
    // Convert the incoming string into an array of individual characters.
    let charArray = sourceText.split("");

    // Initialize a numeric state tracker.
    // 0: Initial state, searching for the first specific character.
    // 1: Intermediate state, the first character was found, now searching for the second.
    // 2: Final state, both specific characters were found in order.
    let stateIndicator = 0;

    // Iterate through each character in the character array.
    for (let charIndex = 0; charIndex < charArray.length; charIndex++) {
        // Evaluate the current state of the pattern search.
        switch (stateIndicator) {
            case 0: // If currently in the initial state (0)
                // Check if the current character matches 'C'.
                if (charArray[charIndex] === "C") {
                    stateIndicator++; // Advance the state to 1.
                }
                break; // Exit the switch for this iteration.
            case 1: // If currently in the intermediate state (1)
                // Check if the current character matches 'F'.
                if (charArray[charIndex] === "F") {
                    stateIndicator = 2; // Set the state to 2, indicating pattern completion.
                }
                // No break here, as per original logic, if 'F' is not found, it implicitly continues to the next char in state 1.
        }
    }

    // After processing all characters, check the final state indicator.
    if (stateIndicator === 2) {
        console.log("Yes"); // Output "Yes" if the pattern was successfully found.
    } else {
        console.log("No"); // Output "No" otherwise.
    }
}

// Read the entire content from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and then pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
