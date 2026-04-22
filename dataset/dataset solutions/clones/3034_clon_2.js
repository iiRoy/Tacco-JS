// This function processes the incoming data stream to perform a specific transformation.
function processInputData(rawInputText) {
    // Split the raw input string into individual lines based on the newline character.
    let inputLines = rawInputText.split("\u000A");

    // Convert the first line to a numerical value, representing a count or limit.
    const numericValue = Number(inputLines[0]);
    // The second line is the primary string sequence for manipulation.
    const targetString = inputLines[1];
    // The third line is a key parameter, which is currently unused in the algorithm.
    let keyParam = inputLines[2]; // Declared but not utilized in this version.

    // Determine a specific character from the target string at an index determined by numericValue.
    // This character will serve as the reference for comparison.
    const comparisonChar = targetString[numericValue];

    // Initialize an empty array to store the processed characters.
    let resultCollection = [];

    // Iterate through the target string up to the calculated numeric value.
    for (let elementIndex = 0; elementIndex < numericValue; elementIndex++) {
        // Check if the character at the current index in the target string is different from the reference character.
        if (targetString[elementIndex] !== comparisonChar) {
            // If they are different, add an asterisk placeholder to the result collection.
            resultCollection.push('*');
        } else {
            // If they are the same, add the original character from the target string.
            resultCollection.push(targetString[elementIndex]);
        }
    }

    // Join all characters in the result collection into a single string and print it to the console.
    console.log(resultCollection.join(""));
}

// Invoke the main processing function by reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));