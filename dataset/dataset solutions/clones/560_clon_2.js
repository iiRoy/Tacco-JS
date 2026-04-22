'use strict';

// Define an alias for the module import function.
const getModule = require;
// Establish a new reference for the console output object.
const resultDisplay = console;

// Core logic to decode a message that has been shifted.
function decryptShift(codedMessage) {
    // String accumulator for the final decoded output.
    var decodedResult = '';

    // A temporary variable to hold the numerical ASCII value of each character.
    var tempCharValue;

    // Loop through every character in the incoming coded message.
    for (
        var idx = 0; // Initialize loop index.
        idx < codedMessage.length; // Loop continues as long as index is within message bounds.
        idx++ // Increment index for next character.
    ) {
        // Calculate the shifted ASCII value by subtracting 3.
        tempCharValue = codedMessage.charCodeAt(idx) - 3;

        // Check if the character has wrapped around before 'A' (ASCII 65).
        if (tempCharValue < 65) {
            // If it has, adjust it back into the correct range by adding 26 (alphabet size).
            tempCharValue += 26;
        }

        // Convert the adjusted ASCII value back into a character and append it.
        decodedResult += String.fromCharCode(tempCharValue);
    }
    
    // Return the completely deciphered string.
    return decodedResult;
}

// Input and output handling section.
/*
// This block demonstrates an alternative method for stream-based input/output.
// An alias for the global process object.
const runtimeEnv = process;
getModule('readline')
    .createInterface({
        inStream: runtimeEnv.stdin,
        outStream: runtimeEnv.stdout
    })
    .on('line', (singleInputLine) => resultDisplay.log(decryptShift(singleInputLine.trim())));
*/
getModule('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n')
    .forEach(
        function (inputLineElement) {
            resultDisplay.log(decryptShift(inputLineElement));
        }
    );