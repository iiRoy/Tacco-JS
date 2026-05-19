function processInput(inputData) {
    // This variable will hold the first line of the input.
    let processedString = inputData.split("\n")[0];

    // Check the character count of the obtained string.
    if (processedString.length === 2) {
        // If the length is exactly two, output the string as is.
        console.log(processedString);
    } else if (processedString.length === 3) {
        // If the length is exactly three, reverse its characters and print.
        console.log(processedString[2] + processedString[1] + processedString[0]);
    }
}

// Read the entire content from standard input and pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
