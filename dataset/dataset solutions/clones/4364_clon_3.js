function processInputDigits(rawInputString) {
    // This routine inspects a given text string to ascertain if it incorporates the numeral '9'.
    // It diligently processes the input, performing necessary sanitization,
    // converting character-based digits into their numerical counterparts,
    // and subsequently verifying the existence of the target digit.

    // --- Input Validation and Preparatory Steps ---

    // Implement a preliminary check to ensure the input is a legitimate string.
    // If the input is not a string, or is null/undefined, it cannot contain '9'.
    if (typeof rawInputString !== 'string' || rawInputString === null || rawInputString === undefined) {
        // In such error scenarios, we determine that '9' is not present.
        console.log('No');
        return;
    }

    // Create an intermediate variable to hold the input after trimming leading/trailing whitespace.
    const sanitizedInput = rawInputString.trim();

    // A secondary check: an empty string (even after trimming) naturally cannot contain '9'.
    if (sanitizedInput.length === 0) {
        console.log('No'); // No digits to check.
        return;
    }

    // Deconstruct the sanitized string into an array of individual characters.
    // Utilizing Array.from() as an alternative to the traditional split('') method.
    const characterComponents = Array.from(sanitizedInput);

    // Transform each character component into its numerical equivalent.
    // An additional filter is applied to discard any non-digit characters
    // that would result in NaN, ensuring that only valid integer digits are processed.
    const validNumericElements = characterComponents
        .map(charItem => Number(charItem)) // Employing Number() constructor for type conversion
        .filter(numVal => !isNaN(numVal) && Number.isInteger(numVal)); // Exclude non-numeric or non-integer values

    // --- Core Algorithm: Ascertaining the Presence of the Digit '9' ---

    // Initialize a boolean indicator; this flag will be set to true if '9' is encountered.
    // This method offers a more direct approach compared to maintaining a running count
    // when the ultimate objective is merely to detect presence.
    let digitNineFound = false;

    // Traverse through the collection of validated numerical elements.
    // A 'for...of' loop is adopted for contemporary JavaScript iteration.
    for (const currentNumber of validNumericElements) {
        // If the current number is precisely '9', activate the flag
        // and immediately terminate the loop. This is an efficiency enhancement,
        // as further examination is unnecessary once '9' has been located.
        if (currentNumber === 9) {
            digitNineFound = true;
            break; // Optimization: cease iteration early.
        }
    }

    // --- Final Outcome Determination ---

    // Based on the state of the 'digitNineFound' flag, output the corresponding result.
    if (digitNineFound) {
        console.log('Yes'); // The digit '9' was positively identified within the input.
    } else {
        console.log('No');  // The digit '9' was not found after a thorough inspection of all relevant digits.
    }
}

// --- System Entry Point for Execution ---

// Acquire the input data from the standard input stream, typically used in competitive programming environments.
// It's crucial to specify UTF-8 encoding to guarantee correct string interpretation.
// Subsequently, invoke the primary processing function with the data retrieved.
processInputDigits(require("fs").readFileSync("/dev/stdin", "utf8"));