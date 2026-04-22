// This module defines a specialized function for pluralizing English words by appending a suitable suffix.
// It aims to provide a robust and flexible way to modify string inputs based on their final character.

/**
 * Augments a given singular term with a standard English plural suffix ('s' or 'es').
 * This function processes the input string and determines the appropriate suffix based on its last character.
 *
 * @param {string} originalWord - The single word string to be pluralized.
 * @returns {string} The pluralized form of the word, or the original word if input is invalid/empty.
 */
function applyPluralizingSuffix(originalWord) {
    // Perform initial validation to ensure the input is a string.
    // Non-string inputs are handled gracefully by returning the input itself with a warning.
    if (typeof originalWord !== 'string') {
        console.warn("Input provided to 'applyPluralizingSuffix' was not a string. Returning original value.");
        return originalWord;
    }

    // If the input string is empty, there's no character to check, and no suffix is needed.
    // An empty string remains an empty string after this operation.
    if (originalWord.length === 0) {
        return originalWord;
    }

    // Retrieve the final character of the word to decide the pluralization rule.
    // Using bracket notation for character access as an alternative to charAt or slice.
    const lastCharacterOfWord = originalWord[originalWord.length - 1];

    let computedSuffix; // Declare a variable to hold the suffix that will be appended.

    // Apply the pluralization logic: if the word ends with 's', append 'es'; otherwise, append 's'.
    // This conditional block determines the value of 'computedSuffix'.
    if (lastCharacterOfWord === 's') {
        computedSuffix = 'es'; // For words already ending in 's', add 'es'.
    } else {
        computedSuffix = 's';  // For all other words, simply add 's'.
    }

    // Combine the original word with the determined suffix using a template literal.
    // This creates the final pluralized form of the word.
    const resultantPluralForm = `${originalWord}${computedSuffix}`;

    // Return the newly constructed plural word.
    return resultantPluralForm;
}

// --- Execution Entry Point for Standard Input/Output ---
// This section is responsible for reading data from standard input,
// processing it using the core logic, and then writing the result to standard output.
// It is designed to be self-contained and typically should not require modifications.

try {
    // Dynamically import the Node.js 'fs' (file system) module for I/O operations.
    const fileSystemModule = require("fs");

    // Define the standard input stream path specific to Unix-like systems.
    const standardInputPath = "/dev/stdin";

    // Specify the character encoding for reading the input file.
    const inputEncoding = "utf8";

    // Read the entire content from standard input synchronously.
    // The content is treated as a raw string buffer initially.
    const rawInputBuffer = fileSystemModule.readFileSync(standardInputPath, inputEncoding);

    // Clean the raw input by removing any leading or trailing whitespace.
    // This ensures consistent processing, especially for inputs that might include newlines.
    const processedInputString = rawInputBuffer.trim();

    // Invoke the primary function with the cleaned input to get the pluralized word.
    const finalResultForDisplay = applyPluralizingSuffix(processedInputString);

    // Print the final, pluralized word to standard output.
    console.log(finalResultForDisplay);

} catch (executionError) {
    // Catch and report any errors that occur during file reading or processing.
    // This provides basic error feedback to the user or system.
    console.error("An unexpected error occurred during script execution:", executionError.message);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}