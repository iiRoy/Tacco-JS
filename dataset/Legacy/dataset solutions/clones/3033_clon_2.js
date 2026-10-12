function processInput(inputData) {
    // Split the entire input string into an array of individual lines.
    let inputLines = inputData.split('\n');

    // Parse the first line as the total count of elements.
    const countElements = parseInt(inputLines[0], 10);
    // The second line is the main string to be processed.
    const inputString = inputLines[1];
    // Parse the third line as the index for the reference character.
    const targetIndex = Number(inputLines[2]);

    // Retrieve the character at the specified target index from the input string.
    const referenceChar = inputString[targetIndex];

    // Initialize an empty array to store the modified characters.
    let resultArray = [];

    // Iterate through the input string from the beginning up to the total count.
    for (let idx = 0; idx < countElements; ++idx) {
        // Compare the current character with the determined reference character.
        if (inputString[idx] !== referenceChar) {
            // If they do not match, append an asterisk to the result array.
            resultArray.push('*');
        } else {
            // If they match, append the original character to the result array.
            resultArray.push(inputString[idx]);
        }
    }

    // Join all characters in the result array into a single string and print it to the console.
    console.log(resultArray.join(''));
}

// Read the entire content from standard input synchronously and pass it to the processing function.
processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
