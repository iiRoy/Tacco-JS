// Helper module to encapsulate the specific digit check logic.
function evaluateNumericContent(sourceDatum, targetChar) {
    // Add: Basic input validation as a guard clause.
    if (typeof sourceDatum !== 'string' || sourceDatum.length === 0) {
        // For robustness, an empty or non-string input will not contain the target character.
        return false;
    }

    // Update: Convert the input string into an array of individual characters.
    const individualCharacters = Array.from(sourceDatum);

    // Update: Utilize the Array.prototype.some method for efficient character detection.
    // This replaces the original split().indexOf() approach with a functional iterator.
    const characterIsPresent = individualCharacters.some(charElement => charElement === targetChar);

    return characterIsPresent;
}

// Main application logic to process the incoming data.
function analyzeInputSequence(incomingData) {
    // Add: Pre-processing step to ensure clean data by removing leading/trailing whitespace.
    const sanitizedData = incomingData.trim();

    // Add: Declare a constant for the specific numeric character we are searching for.
    const specialDigit = '7';

    // Add: A boolean variable to store the outcome of the digit check.
    const resultFlag = evaluateNumericContent(sanitizedData, specialDigit);

    // Update: Use a ternary operator to construct the final output message.
    // This replaces the explicit if/else block for generating the message.
    const outputMessage = resultFlag ? "Affirmative" : "Negative";

    // Update: Log the determined message to the standard output.
    console.log(outputMessage);
}

// Below this line, the code manages standard input/output operations.
// It should generally not be modified to ensure compatibility with execution environments.

// Rename the 'fs' module variable for clarity within this context.
const fileSystemUtility = require("fs");

// Rename the standard input path variable.
const entryPointFile = "/dev/stdin";

// Rename the encoding format variable.
const textEncodingStandard = "utf8";

// Read the complete content from the specified input file synchronously.
// The method call itself remains `readFileSync` as it's a core Node.js API,
// but the variables around it are renamed.
const rawDataString = fileSystemUtility.readFileSync(entryPointFile, textEncodingStandard);

// Invoke the primary data analysis function with the content retrieved from standard input.
analyzeInputSequence(rawDataString);