// This module is designed to process text input, specifically to identify and pluralize the first meaningful word found.

/**
 * Determines the appropriate plural form of a given word based on a simple linguistic rule.
 * The rule is: if the word ends in 's', append 'es'; otherwise, append 's'.
 *
 * @param {string} rawInputContent The raw text content received, typically from a file or standard input.
 * @returns {void} Outputs the pluralized word to the console.
 */
const determinePluralForm = (rawInputContent) => {
    // Step 1: Perform initial validation of the input content.
    // Ensure the input is a non-empty string to prevent unexpected errors.
    // This adds robustness beyond the original code's implicit assumptions.
    if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
        console.error("Processing Error: Input content is either not a string or is empty. Cannot determine plural form.");
        return; // Exit the function gracefully if input is invalid.
    }

    // Step 2: Extract the primary word from the input stream.
    // We first split the raw content by common newline characters (both Unix \n and Windows \r\n).
    // Then, we take only the very first line to focus on a single word/phrase.
    // Finally, we trim any leading or trailing whitespace from this line.
    const firstProcessedLine = rawInputContent.split(/\r?\n/)[0].trim();

    // Step 3: Handle the scenario where the extracted primary line is empty after trimming.
    // If the line is empty, the original logic would default to adding 's'. We replicate this.
    if (firstProcessedLine.length === 0) {
        console.log('s'); // An empty word pluralizes to 's' based on original behavior.
        return; // Terminate execution as the word is processed.
    }

    // Step 4: Analyze the last character of the word to decide the pluralization rule.
    // We directly access the last character of the string, which is more concise than slicing.
    const finalCharacterOfWord = firstProcessedLine[firstProcessedLine.length - 1];

    // Step 5: Compute the specific suffix needed for pluralization.
    let calculatedSuffix = ''; // Declare a mutable variable for the suffix.
    if (finalCharacterOfWord === 's') {
        calculatedSuffix = 'es'; // If the word ends with 's', append 'es'.
    } else {
        calculatedSuffix = 's'; // For all other endings, simply append 's'.
    }

    // Step 6: Assemble the final pluralized word.
    // Instead of manipulating an array of characters, we directly concatenate strings,
    // which can be more efficient for this particular operation.
    const finalPluralizedString = firstProcessedLine + calculatedSuffix;

    // Step 7: Output the resulting pluralized string to standard output.
    console.log(finalPluralizedString);
};

// --- Execution Entry Point ---
// This block is responsible for reading the input and initiating the processing.

// Read the entire content from standard input (/dev/stdin).
// The 'utf8' encoding ensures proper character interpretation.
// Explicitly cast the buffer result to a String for consistency.
const inputFileContent = String(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Invoke the main pluralization logic with the content retrieved from the input.
determinePluralForm(inputFileContent);