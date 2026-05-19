// The entire input data is received in the 'inputData' parameter
function ProcessInput(inputData) {
    let initialString; // Declare a variable to hold the first line of input
    const inputLines = inputData.split("\n"); // Split the input into an array of lines
    initialString = inputLines[0]; // Assign the first line to initialString

    let minimumOperations = -1; // Initialize the minimum operation count to -1

    // Iterate through all lowercase English alphabet characters from 'a' to 'z'
    for (let charCodeIterator = 'a'.charCodeAt(0); charCodeIterator <= 'z'.charCodeAt(0); charCodeIterator++) {
        // Check if the initial string already consists of a single repeated character
        if (/^([a-z])\1*$/.test(initialString)) {
            minimumOperations = 0; // If so, no operations are needed
            break; // Exit the loop as the minimum is found
        }

        let currentWorkingString = initialString; // Start with the original string for this character's attempt
        let nextIterationString = ''; // Initialize an empty string for the next transformation
        const targetCharacter = String.fromCharCode(charCodeIterator); // Get the character for the current iteration (e.g., 'a', 'b', ...)
        let currentOperationCount = 0; // Counter for operations in the current character's attempt

        // Loop until the string becomes a single repeated character
        while (true) {
            // This loop processes the string to create the next iteration's string
            // It looks at characters at index 'stringIndex' and 'stringIndex + 1'
            // If either matches 'targetCharacter', 'targetCharacter' is added to 'nextIterationString'
            // Otherwise, the character at 'stringIndex' is added
            for (let stringIndex = 0; stringIndex < currentWorkingString.length - 1; stringIndex++) {
                if (targetCharacter === currentWorkingString.charAt(stringIndex)) {
                    nextIterationString += targetCharacter;
                } else if (targetCharacter === currentWorkingString.charAt(stringIndex + 1)) {
                    nextIterationString += targetCharacter;
                } else {
                    nextIterationString += currentWorkingString.charAt(stringIndex);
                }
            }

            currentOperationCount++; // Increment the operation count for this transformation

            // Output the transformed string for debugging or intermediate results
            console.log(nextIterationString);

            // Check if the transformed string now consists of a single repeated character
            if (/^([a-z])\1*$/.test(nextIterationString)) {
                break; // If so, this character's attempt is complete
            }

            currentWorkingString = nextIterationString; // The transformed string becomes the input for the next iteration
            nextIterationString = ''; // Reset the next iteration string
        }

        // Update the overall minimum operations if the current attempt was better
        if (minimumOperations === -1 || minimumOperations > currentOperationCount) {
            minimumOperations = currentOperationCount;
        }
    }

    // Output the final minimum number of operations found across all character attempts
    console.log(minimumOperations);
}

// This function is declared but not used in the provided logic.
const convertString = function(sourceStr, charToMatch) {
    // This function is empty and has no functional impact.
};

// This function is declared but not used in the provided logic.
// It's intended to replace a character at a specific index.
const replaceCharAtIndex = function(originalText, indexPosition, replacementValue) {
    return originalText.substring(0, indexPosition) + replacementValue + originalText.substring(indexPosition + 1);
};

// The following line reads from standard input and calls the main processing function.
// Do not modify this part as it handles standard I/O.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
