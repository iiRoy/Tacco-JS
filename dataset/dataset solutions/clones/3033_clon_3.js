// Expert-generated Type III code clone.
// This function processes multi-line string input to perform a character transformation.
function processInputAndTransform(rawInputPayload) {
    // Split the entire input payload into an array of individual lines.
    const parsedInputLines = rawInputPayload.split('\n');

    // Essential validation: ensure all expected input lines are present.
    if (parsedInputLines.length < 3) {
        console.error("Input processing failed: Expected at least three lines (N, S, K), but fewer were provided.");
        return; // Terminate execution if input is insufficient.
    }

    // Parse the first line as the maximum number of characters to iterate over.
    // Using parseInt with radix 10 for explicit base conversion.
    const charCountLimit = parseInt(parsedInputLines[0], 10);

    // The second line is the primary string data that will be transformed.
    const mainSequenceString = parsedInputLines[1];

    // The third line provides the zero-based index for the reference character.
    const referenceCharacterIndex = parseInt(parsedInputLines[2], 10);

    // Validate that the parsed numeric values are indeed numbers.
    if (isNaN(charCountLimit) || isNaN(referenceCharacterIndex)) {
        console.error("Input processing failed: Numeric values for N or K are invalid.");
        return;
    }

    // Add a guard for negative iteration limits, as this is typically an error.
    if (charCountLimit < 0) {
        console.error("Input processing failed: Character count limit (N) cannot be negative.");
        return;
    }

    // Determine the specific character at the reference index from the main sequence.
    // If 'referenceCharacterIndex' is out of bounds for 'mainSequenceString',
    // 'mainSequenceString[referenceCharacterIndex]' will correctly evaluate to 'undefined',
    // preserving the original code's behavior for such edge cases.
    const fixedComparisonCharacter = mainSequenceString[referenceCharacterIndex];

    // Initialize an array to store the resulting transformed characters.
    const transformedCharacterParts = [];

    // Begin iterating through the sequence up to the specified character limit.
    for (let currentIterationIndex = 0; currentIterationIndex < charCountLimit; ++currentIterationIndex) {
        // Fetch the character at the current position. If 'currentIterationIndex'
        // exceeds the length of 'mainSequenceString', this will also be 'undefined'.
        const characterAtCurrentPosition = mainSequenceString[currentIterationIndex];

        // Apply the core transformation logic:
        // If the character at the current position is NOT identical to the fixed comparison character,
        // an asterisk '*' is added to the result.
        // Otherwise (if they are identical, including both being 'undefined'), the original character is retained.
        if (characterAtCurrentPosition !== fixedComparisonCharacter) {
            transformedCharacterParts.push('*');
        } else {
            transformedCharacterParts.push(characterAtCurrentPosition);
        }
    }

    // Concatenate all transformed characters into a single string and output it.
    console.log(transformedCharacterParts.join(''));
}

// Entry point: Read the entire standard input and pass it to the processing function.
// This part remains similar as it often represents environment-specific I/O.
processInputAndTransform(require('fs').readFileSync('/dev/stdin', 'utf8'));