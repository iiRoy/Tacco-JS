// This function identifies the earliest alphabetical character (a-z) that is absent
// from the provided input string. If all characters are present, it indicates so.
function findFirstMissingAlphabet(sourceData) {
    // Extract the primary line of text from the raw input, assuming newline separation.
    // An empty string is used as a fallback if no lines are found or input is null/undefined.
    let inputLineContent = String(sourceData).split('\n')[0] || '';

    // Create a data structure to efficiently track all unique lowercase characters
    // that are present within the input line. This avoids repeated string scans.
    const presentCharsSet = new Set();
    for (let char of inputLineContent) {
        // Only consider actual lowercase English letters for inclusion in the set.
        // This acts as a filter for other characters (numbers, symbols, uppercase).
        if (char >= 'a' && char <= 'z') {
            presentCharsSet.add(char);
        }
    }

    let resultCharacter = 'None'; // Initialize the output with the default "not found" message.
    const alphabetStartCode = 'a'.charCodeAt(0); // ASCII code for 'a'
    const alphabetEndCode = 'z'.charCodeAt(0);   // ASCII code for 'z'

    // Iterate through the ASCII character codes corresponding to all lowercase English letters.
    // This systematic check ensures we find the *first* missing character in alphabetical order.
    for (let codeIterator = alphabetStartCode; codeIterator <= alphabetEndCode; codeIterator++) {
        const currentAlphabetChar = String.fromCharCode(codeIterator);

        // Check if the current character from the alphabet sequence is NOT found
        // within our collected set of present characters.
        if (!presentCharsSet.has(currentAlphabetChar)) {
            resultCharacter = currentAlphabetChar; // If missing, store it as the result.
            break; // Exit the loop immediately, as we only need the earliest missing character.
        }
    }

    // Output the final determined result to the standard console.
    console.log(resultCharacter);
}

// Entry point for executing the character analysis within a typical system environment.
// Reads all incoming data from standard input as a UTF-8 string.
const systemInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the obtained system input.
findFirstMissingAlphabet(systemInputBuffer);