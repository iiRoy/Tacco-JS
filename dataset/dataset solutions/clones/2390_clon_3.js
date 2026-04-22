// Function responsible for executing a Caesar cipher rotation on an input string.
function processCaesarShift(dataPayload) {
    // Define fundamental constants for alphanumeric transformations.
    const ALPHABET_SPAN_SIZE = 26;
    const CODE_OF_LETTER_A = 'A'.charCodeAt(0);

    // Deconstruct the incoming raw data into individual lines.
    const incomingLines = dataPayload.split('\n');

    // Parse the numerical shift value from the first line of input.
    // A radix of 10 is specified for explicit decimal conversion.
    let nominalShiftAmount = parseInt(incomingLines[0], 10);

    // In case of invalid or non-numeric input for the shift amount,
    // default to a zero shift to prevent errors.
    if (isNaN(nominalShiftAmount)) {
        nominalShiftAmount = 0;
    }

    // Calculate the actual shift to be applied, ensuring it wraps around
    // the alphabet size, making it effectively between 0 and 25.
    const finalShiftDelta = nominalShiftAmount % ALPHABET_SPAN_SIZE;

    // Retrieve the message string that needs to be encoded from the second line.
    const originalMessageText = incomingLines[1];

    // Prepare an array to sequentially collect the characters of the encrypted message.
    const outputCharactersBuffer = [];

    // Traverse through each character present in the original message.
    for (let charIterator = 0; charIterator < originalMessageText.length; charIterator++) {
        const currentSymbol = originalMessageText[charIterator];

        // Obtain the ASCII (UTF-16) numerical value of the current character.
        const currentSymbolCode = currentSymbol.charCodeAt(0);

        // Determine the 0-indexed position of the character within the English alphabet (A=0, B=1, ...).
        const initialAlphabetPosition = currentSymbolCode - CODE_OF_LETTER_A;

        // Apply the shift. The addition of ALPHABET_SPAN_SIZE before the modulo
        // ensures that the result is always non-negative, even if intermediate values
        // were to become negative (though not expected with positive shifts).
        const newAlphabetPosition = (initialAlphabetPosition + finalShiftDelta + ALPHABET_SPAN_SIZE) % ALPHABET_SPAN_SIZE;

        // Convert the newly computed alphabet position back to its corresponding ASCII code.
        const newSymbolCode = newAlphabetPosition + CODE_OF_LETTER_A;

        // Transform the new ASCII code back into a character and append it to our buffer.
        outputCharactersBuffer.push(String.fromCharCode(newSymbolCode));
    }

    // Concatenate all characters in the buffer to form the complete transformed string.
    const encryptedResultString = outputCharactersBuffer.join('');

    // Display the final encrypted message to the standard output.
    console.log(encryptedResultString);
}

// This section is standard competitive programming boilerplate for input reading.
// It reads the entire standard input and passes it to our main processing function.
processCaesarShift(require("fs").readFileSync("/dev/stdin", "utf8"));