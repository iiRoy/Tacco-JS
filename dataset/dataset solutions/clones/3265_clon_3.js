function ProcessInputData(rawDataString) {
    // Define the specific digits we are looking for.
    const REQUIRED_DIGITS = ['1', '9', '7', '4'];

    // Initialize a Set to keep track of the unique required digits found.
    const foundDistinctDigits = new Set();

    // Initialize a counter for how many of the first four tokens match any of our required digits.
    let matchedTargetCount = 0;

    // Pre-process the raw input string: trim whitespace and split into individual tokens.
    const trimmedInput = rawDataString.trim();
    const inputTokens = trimmedInput.split(/\s+/); // Use regex to handle multiple spaces

    // Early exit if there aren't enough tokens to check the first four positions.
    if (inputTokens.length < 4) {
        console.log("NO");
        return;
    }

    // Iterate through the first four tokens of the input.
    for (let k = 0; k < 4; k++) {
        const currentToken = inputTokens[k];

        // Check if the current token is one of our required digits using a switch statement.
        switch (currentToken) {
            case '1':
                foundDistinctDigits.add('1');
                matchedTargetCount++;
                break;
            case '9':
                foundDistinctDigits.add('9');
                matchedTargetCount++;
                break;
            case '7':
                foundDistinctDigits.add('7');
                matchedTargetCount++;
                break;
            case '4':
                foundDistinctDigits.add('4');
                matchedTargetCount++;
                break;
            // No default case needed as we only care about these specific values.
        }
    }

    // Determine the final result based on two conditions:
    // 1. All unique required digits ('1', '9', '7', '4') must have been found.
    // 2. Exactly four of the processed tokens must have been among these required digits.
    //    This ensures that no "other" numbers were present in the first four positions
    //    and that the count of matching digits is exactly four.
    if (foundDistinctDigits.size === REQUIRED_DIGITS.length && matchedTargetCount === 4) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

// Read input from standard input and pass it to our processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));