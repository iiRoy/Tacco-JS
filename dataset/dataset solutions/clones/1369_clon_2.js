function ProcessInputData (rawData) {
    // Divide the entire input block into an array where each element is a separate line.
    const textSegments = rawData.split('\n');

    // Begin an indefinite loop to process each line.
    for (;;) {
        // Extract the next line from the beginning of the array and then
        // break it down into an array of individual character strings.
        const currentCharacters = textSegments.shift().split('');

        // Check if the initial character of the current sequence is the digit '0'.
        if (currentCharacters[0] === '0') {
            // If it is, this signifies the termination condition, so exit the loop.
            break;
        }

        // Convert each character string in the array to its integer representation,
        // then compute the sum of all these numbers. The final sum is then displayed.
        console.log(currentCharacters.map(parseInt).reduce(function (accumulator, currentValue) {
            return accumulator + currentValue;
        }));
    }
}

// Execute the primary data processing routine, feeding it content
// acquired from the standard input stream using Node.js's file system module.
ProcessInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));