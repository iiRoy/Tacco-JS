function processInput(rawData) {
    // Helper function to reverse a given string.
    const flipString = (str) => {
        // Splits the string into an array of characters, reverses the array, then joins it back into a string.
        return str.split('').reverse().join('');
    };

    // Define the target words and immediately reverse them.
    // This prepares them for comparison with the reversed input string.
    const REVERSED_TERMS = ['dream', 'dreamer', 'erase', 'eraser'].map(flipString);

    // Take the first line of the input, and reverse it.
    const REVERSED_INPUT_STRING = flipString(rawData.split('\n')[0]);

    // Initialize a pointer to track the current position in the reversed input string.
    var currentPosition = 0;

    // Loop indefinitely, attempting to match reversed terms from the current position.
    while (true) {
        // Find the first reversed term that matches the beginning of the reversed input string
        // starting from the 'currentPosition'.
        var matchedTerm = REVERSED_TERMS.find((termCandidate) => REVERSED_INPUT_STRING.startsWith(termCandidate, currentPosition));

        // If no matching term is found, it means the input string cannot be fully decomposed by the terms.
        if (!matchedTerm) {
            break; // Exit the loop.
        }

        // If a term is matched, advance the current position by the length of the matched term.
        currentPosition += matchedTerm.length;
    }

    // After the loop, check if the entire reversed input string has been consumed.
    // If 'currentPosition' equals the total length of the reversed input string,
    // it means the original string could be formed by the given words.
    if (REVERSED_INPUT_STRING.length === currentPosition) {
        console.log('YES');
    } else {
        // Otherwise, the original string could not be formed.
        console.log('NO');
    }
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
