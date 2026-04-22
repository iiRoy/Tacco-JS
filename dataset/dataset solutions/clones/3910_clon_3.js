// This program determines if a specific set of characters are all present within an input string.

/**
 * Processes a given text string to verify the existence of predefined characters.
 * It checks for 'a', 'b', and 'c' within the provided text.
 * The outcome is printed to the console: "Yes" if all characters are found, "No" otherwise.
 *
 * @param {string} targetString The text content to be analyzed.
 */
function verifyCharacterPresence(targetString) {
    // Define the sequence of characters that must be located within the input.
    const charactersToFind = ['a', 'b', 'c'];
    let allEssentialCharactersIdentified = true; // A boolean flag to track the search result.

    // Perform an initial validation of the input data.
    // If the input is not a string or is empty after trimming, it's considered invalid.
    if (typeof targetString !== 'string' || targetString.trim().length === 0) {
        // Output "No" as the characters cannot be found in an invalid or empty string.
        console.log("No");
        return; // Terminate execution for invalid input.
    }

    // Iterate through each character in our required set.
    for (let currentCharacterIndex = 0; currentCharacterIndex < charactersToFind.length; currentCharacterIndex++) {
        const characterToSearch = charactersToFind[currentCharacterIndex];

        // Attempt to find the current character's first occurrence in the target string.
        const foundPosition = targetString.indexOf(characterToSearch);

        // If 'indexOf' returns -1, the character was not found.
        if (foundPosition === -1) {
            allEssentialCharactersIdentified = false; // Update the flag to indicate a missing character.
            // Optimization: Once one character is confirmed missing, there's no need to check further.
            break;
        }
    }

    // Based on the final state of our flag, output the corresponding message.
    if (allEssentialCharactersIdentified) {
        console.log("Yes"); // All required characters were successfully located.
    } else {
        console.log("No"); // At least one required character was not found.
    }
}

// Entry point of the script:
// 1. Reads the entire content from standard input ('/dev/stdin').
// 2. Assumes the input is UTF-8 encoded text.
// 3. Trims any leading or trailing whitespace from the input.
// 4. Calls the main processing function with the cleaned input.
const rawStreamData = require('fs').readFileSync('/dev/stdin', 'utf8');
verifyCharacterPresence(rawStreamData.trim());