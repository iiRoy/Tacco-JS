/*
 * This JavaScript module is designed to process an input string.
 * Its primary function is to inspect the final character of the provided text
 * and produce a specific phonetic output based on that character's value.
 */
function processInputValues(incomingText) { // Defines the main processing routine
    // The raw input string is first broken down into an array where each element is a single character.
    const characterArray = incomingText.split(''); // Converts the input into a sequence of individual characters.

    // We then identify the very last character present in this newly formed array.
    const endingCharacter = characterArray[characterArray.length - 1]; // Grabs the character at the ultimate position.

    // A variable intended for storing potential output, though it remains unused in this specific logic path.
    let consoleOutputString = ''; // Initializes an empty string for potential future use.

    // Evaluation starts here: checks for a specific set of numerical characters.
    if (endingCharacter == '2' || endingCharacter == '4' || endingCharacter == '5' || endingCharacter == '7' || endingCharacter == '9') {
        console.info('hon'); // If matched, prints 'hon' to the console.
        return; // Exits the function immediately after output.
    }
    // Secondary check: specifically targets the character '3'.
    else if (endingCharacter == '3') {
        console.info('bon'); // If '3' is found, prints 'bon'.
        return; // Exits the function.
    }
    // Final fallback check: covers all other specified numerical characters.
    else if (endingCharacter == '0' || endingCharacter == '1' || endingCharacter == '6' || endingCharacter == '8') {
        console.info('pon'); // For these digits, 'pon' is the output.
        return; // Exits the function.
    }
    // No explicit 'else' for other characters, as the problem implies only digits 0-9.
}


// This line ensures the script is runnable and receives input from standard input.
// It reads the entire content of '/dev/stdin' as a UTF-8 string and passes it
// to our primary function for processing.
processInputValues( require('fs').readFileSync('/dev/stdin', 'utf8') );