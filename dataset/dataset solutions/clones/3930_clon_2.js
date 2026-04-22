const fileSystemModule = require('fs'); // Obtain the file system module.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Read data from standard input synchronously, using UTF-8 encoding.

const textualLines = rawInputContent.split('\n'); // Divide the raw input string into an array of lines.

const targetString = textualLines.shift(); // Extract the first line as the primary string for processing.

const characterExistenceMap = {}; // Initialize an empty object to serve as a map for character presence.

let finalOutcome = ''; // Declare a variable to store the computed result, initialized as an empty string.

// Populate the character existence map with all lowercase English alphabet characters.
// Initially, mark all of them as not present.
for (let asciiCode = 65; asciiCode < 91; asciiCode++) { // Iterate through ASCII values for uppercase letters (A-Z).
    let lowerChar = String.fromCharCode(asciiCode).toLowerCase(); // Convert ASCII code to a lowercase character.
    characterExistenceMap[lowerChar] = false; // Set the character's presence flag to false.
}

// Evaluate the length of the target string to determine the processing logic.
if (targetString.length === 26) {
    // Scenario 1: The string contains exactly 26 characters.
    // Attempt to find the lexicographically smallest string that is greater than the target string.

    const currentStringLength = targetString.length; // Store the length for efficiency.
    const availableCharacters = []; // An array to hold characters from the suffix that are being considered.
    let nextStringFound = false; // A flag to indicate if a suitable next string has been located.

    // Iterate backwards from the end of the string.
    for (let charIndex = currentStringLength - 1; charIndex >= 0; charIndex--) {
        // Add the character at the current index to our collection of available characters.
        availableCharacters.push(targetString.slice(charIndex, charIndex + 1));
        // Maintain the collection in sorted order to easily find the smallest character.
        availableCharacters.sort();

        // Extract the prefix of the string up to the current character.
        const currentPrefix = targetString.slice(0, charIndex);

        // Iterate through the sorted available characters to find one that forms a larger string.
        for (let suffixCharIterator = 0; suffixCharIterator < availableCharacters.length; suffixCharIterator++) {
            const candidateSuffixChar = availableCharacters[suffixCharIterator]; // Get the current candidate character.
            // Compare the new string (prefix + candidate) with the original target string.
            if (currentPrefix + candidateSuffixChar > targetString) {
                nextStringFound = true; // A valid next string has been identified.
                finalOutcome = currentPrefix + candidateSuffixChar; // Construct the final result.
                break; // Exit this inner loop as the smallest valid character is found.
            }
        }

        // If a next string was found in the inner loop, we can stop searching further.
        if (nextStringFound) {
            break; // Exit the outer loop.
        }
    }

    // If after all attempts, no lexicographically larger string was found.
    if (!nextStringFound) {
        finalOutcome = -1; // Set the result to -1 to indicate no solution.
    }

} else {
    // Scenario 2: The string does not contain 26 characters.
    // Find the first missing lowercase English letter and append it to the string.

    // Mark the presence of characters that are already in the target string.
    for (let stringPos = 0; stringPos < targetString.length; stringPos++) {
        characterExistenceMap[targetString[stringPos]] = true; // Mark character as present.
    }

    let missingAlphabetChar = ''; // Variable to store the first missing character.
    // Iterate through all lowercase alphabet characters to find the first one not present.
    for (let alphabetCode = 65; alphabetCode < 91; alphabetCode++) {
        const currentAlphabetChar = String.fromCharCode(alphabetCode).toLowerCase(); // Convert to lowercase.
        if (!characterExistenceMap[currentAlphabetChar]) {
            missingAlphabetChar = currentAlphabetChar; // This is the first character that is not in the string.
            break; // Stop the search once the first missing character is found.
        }
    }
    // The result is the original string concatenated with the first missing character.
    finalOutcome = targetString + missingAlphabetChar;
}

// Output the final calculated result to the console.
console.log(finalOutcome);