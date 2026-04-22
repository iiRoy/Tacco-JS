// This module encapsulates a specific text transformation rule.
// Its primary purpose is to adjust the ending of a given string,
// typically for pluralization, based on its final character.
function applyPluralizationRule(rawInputPayload) {
    // Step 1: Input Validation and Pre-processing
    // Ensure the provided input is a valid string. If not, log an error and exit gracefully.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.length === 0) {
        console.error("Processing Error: The input payload must be a non-empty string. Aborting transformation.");
        // In a real application, one might throw an exception or return a specific error code.
        return ""; 
    }

    // Extract the very first line from the potentially multi-line input.
    // This ensures that only the initial segment of text is considered for modification.
    const firstMeaningfulLine = rawInputPayload.split('\n')[0];

    // Step 2: Validate the Extracted Line
    // If the extracted line is empty or consists only of whitespace,
    // there's nothing to process according to the rule.
    if (!firstMeaningfulLine || firstMeaningfulLine.trim().length === 0) {
        console.warn("Processing Warning: The primary input line was empty or contained only whitespace. No suffix applied.");
        return firstMeaningfulLine; // Return the original (empty/whitespace) line.
    }

    // Step 3: Character Analysis
    // Determine the total number of characters in the line we are processing.
    const stringLength = firstMeaningfulLine.length;

    // Identify the character at the very end of the string.
    // This character dictates which suffix rule will be applied.
    let trailingChar = '';
    if (stringLength > 0) {
        trailingChar = firstMeaningfulLine[stringLength - 1];
    } else {
        // This case should ideally be caught by the previous `if (!firstMeaningfulLine ...)` block,
        // but it serves as an additional defensive check for robustness.
        console.warn("Internal Warning: String had zero length after initial processing. Cannot determine trailing character.");
        return firstMeaningfulLine;
    }

    // Step 4: Suffix Determination Logic
    // Based on the identified trailing character, select the appropriate ending.
    let appendedEnding = '';
    const specialPluralConditionChar = 's'; // The specific character that triggers the alternative rule.

    if (trailingChar === specialPluralConditionChar) {
        appendedEnding = "es"; // Rule: If the word ends in 's', append 'es'.
    } else {
        appendedEnding = specialPluralConditionChar; // Default Rule: Otherwise, append 's'.
    }
    
    // Step 5: Final String Construction
    // Concatenate the original string with the newly determined suffix.
    const resultantString = firstMeaningfulLine + appendedEnding;

    // Step 6: Output
    // Display the fully transformed string to the console.
    console.log(resultantString);
}

// The following section is responsible for handling standard input/output operations.
// It reads the entire content from stdin and passes it to our core processing function.
// This part is crucial for the execution environment and should not be modified.
// DO NOT ALTER THE CODE BELOW THIS COMMENT.
applyPluralizationRule(require("fs").readFileSync("/dev/stdin", "utf8"));