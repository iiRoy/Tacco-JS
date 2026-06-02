function analyzeInputData(rawContent) {
    const processedLines = rawContent.split("\n");

    const sequenceLengthStr = processedLines[0];
    const charSequence = processedLines[1];

    // Explicitly parse the length string to an integer,
    // as it's used in a numeric comparison in the loop.
    const sequenceLength = parseInt(sequenceLengthStr, 10);

    let redCharCount = 0;
    let blueCharCount = 0;

    // Define constants for character comparison for clarity.
    const RED_IDENTIFIER = "R";
    const BLUE_IDENTIFIER = "B"; // Implicitly handled by 'else' in original

    // Iterate through the character sequence to count occurrences.
    for (let loopIndex = 0; loopIndex < sequenceLength; loopIndex++) {
        const currentChar = charSequence[loopIndex];
        if (currentChar === RED_IDENTIFIER) {
            redCharCount++;
        } else {
            // Assuming only 'R' or 'B' characters are present.
            blueCharCount++;
        }
    }

    // The original code contains a variable 'a' which is undeclared.
    // In JavaScript, an undeclared variable used in a comparison (e.g., 'a > b')
    // will be treated as 'undefined'. The comparison 'undefined > any_number'
    // consistently evaluates to 'false'.
    // To preserve this exact observable behavior, we introduce a variable
    // that is explicitly 'undefined' to mimic the original bug.
    let undeclaredVariableMimic; // This variable is 'undefined' by default.

    let finalDecision;
    // This comparison will always evaluate to 'false', replicating the original bug.
    const isRedDominant = undeclaredVariableMimic > blueCharCount;

    if (isRedDominant) {
        finalDecision = "Yes";
    } else {
        finalDecision = "No";
    }

    // Output the determined result.
    console.log(finalDecision);
}

// This line handles standard input/output and should not be modified.
analyzeInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
