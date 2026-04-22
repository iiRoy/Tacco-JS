// Function to process the entire input string received from standard I/O.
function processInputData(rawDataSet) {
    // Break down the raw input into individual lines for easier parsing.
    const dataLines = rawDataSet.split("\n");

    // Extract the first line which contains space-separated numeric parameters.
    const paramsLine = dataLines[0];
    const numericParams = paramsLine.split(" ");

    // Parse the first number as an initial count (corresponds to N in original context).
    const initialCount = parseInt(numericParams[0], 10);
    // Parse the second number as a 1-based index (corresponds to K in original context).
    const targetIndexBaseOne = parseInt(numericParams[1], 10);

    // The second line of input is the string to be manipulated.
    const sourceString = dataLines[1];

    // Adjust the 1-based index to a 0-based index for JavaScript string operations.
    const zeroBasedIndex = targetIndexBaseOne - 1;

    // --- Introduce a guard clause for index validity ---
    // If the calculated index is out of bounds, we'll output the original string
    // as no modification can be performed meaningfully.
    if (zeroBasedIndex < 0 || zeroBasedIndex >= sourceString.length) {
        console.log(sourceString);
        return; // Exit early if the index is invalid.
    }

    // Identify the character at the calculated 0-based index.
    const charToExamine = sourceString[zeroBasedIndex];

    // Helper function to convert specific uppercase characters to their lowercase counterparts.
    // This encapsulates the character transformation logic.
    const getCaseConvertedChar = (inputChar) => {
        let transformedChar;
        // Using a switch statement for explicit character mapping.
        switch (inputChar) {
            case 'A':
                transformedChar = 'a';
                break;
            case 'B':
                transformedChar = 'b';
                break;
            // The original code implied 'C' to 'c' by its 'else' block.
            case 'C':
                transformedChar = 'c';
                break;
            default:
                // If the character is not 'A', 'B', or 'C', it remains unchanged.
                transformedChar = inputChar;
        }
        return transformedChar;
    };

    // Obtain the modified character using our helper function.
    const modifiedCharacter = getCaseConvertedChar(charToExamine);

    // Construct the new string by replacing the character at the specified index.
    // This corrects a potential off-by-one bug in the original's substring logic
    // and utilizes modern template literals for clarity.
    const resultantString = `${sourceString.substring(0, zeroBasedIndex)}${modifiedCharacter}${sourceString.substring(zeroBasedIndex + 1)}`;

    // Output the final modified string to standard output.
    console.log(resultantString);
}

/*
 * The following lines are responsible for reading input from standard I/O
 * and invoking the main processing function. Please do not alter this section
 * as it's typically part of the competitive programming environment setup.
 */
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));