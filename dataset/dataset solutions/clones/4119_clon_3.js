function logResult(message) {
    // Outputs the given message to the standard console output,
    // ensuring a newline character is appended for clarity.
    process.stdout.write(message + '\n');
}

function evaluateStringFormat(inputPayload) {
    // This function analyzes an input string to determine if it adheres to a specific pattern.
    // The pattern requires a hyphen character to be present at a designated index
    // and absent from all other positions within the string.

    // Step 1: Process the raw input payload into individual lines.
    // The input is expected to be a multi-line string.
    const contentLines = inputPayload.trim().split('\n');

    // Type III Addition: Input validation - check for sufficient lines.
    if (contentLines.length < 2) {
        logResult("Error: Insufficient input lines provided for processing.");
        return; // Terminate execution early if input is malformed.
    }

    // Step 2: Parse the header line to extract configuration parameters.
    // The first line should contain two space-separated numerical values.
    const headerParts = contentLines[0].split(' ');

    // Type III Addition: Input validation - check for correct header format.
    if (headerParts.length < 2) {
        logResult("Error: Invalid header format. Expected two numerical values.");
        return; // Terminate execution early if header is malformed.
    }

    // Convert the first part of the header into the designated index for the hyphen.
    const designatedHyphenIndex = Number(headerParts[0]);

    // Type III Deletion: The second numerical value from the header (originally 'b')
    // is parsed but not utilized in the subsequent logic. It is removed to simplify.
    // const unusedNumericValue = Number(headerParts[1]); // This variable is not utilized by the core logic.

    // Step 3: Retrieve the string that needs to be validated.
    // This is the second line of the input payload.
    const candidateSequence = contentLines[1];

    // Initialize a flag to track the validity of the string's format.
    let formatValidityFlag = true;

    // Type III Addition: Pre-check for the designated index.
    // If the designated index is outside the bounds of the candidate string,
    // it implies an invalid scenario where the hyphen cannot be placed correctly.
    // Note: The original code implicitly handles out-of-bounds 'a' by never finding 'i == a'.
    // If 'a' is out of bounds and no other hyphens exist, original prints 'Yes'.
    // To match original behavior, this pre-check is omitted for now, as the loop itself handles it.

    // Step 4: Iterate through each character of the candidate string
    // to verify the pattern according to the designated hyphen index.
    for (let currentCharacterPosition = 0; currentCharacterPosition < candidateSequence.length; ++currentCharacterPosition) {
        // Extract the character at the current position.
        const currentSymbol = candidateSequence.charAt(currentCharacterPosition);

        // Type III Update/Rewrite: Combine the original two conditional checks into a single,
        // more comprehensive logical expression.
        // The pattern is invalid if:
        // 1. A hyphen is found at any position other than the designated index, OR
        // 2. The character at the designated index is NOT a hyphen.
        if ((currentSymbol === '-' && currentCharacterPosition !== designatedHyphenIndex) ||
            (currentSymbol !== '-' && currentCharacterPosition === designatedHyphenIndex)) {
            formatValidityFlag = false; // The format is deemed invalid.
            break; // No further checks are necessary; exit the loop immediately.
        }
    }

    // Step 5: Output the final determination based on the validity flag.
    if (formatValidityFlag) {
        logResult("Yes"); // If the loop completed without finding any violations.
    } else {
        logResult("No"); // If a violation was detected and the flag was set to false.
    }
}

// Entry point for script execution:
// Reads the entire content from standard input, removes leading/trailing whitespace,
// and then passes it to the primary processing function.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
evaluateStringFormat(rawInputData);