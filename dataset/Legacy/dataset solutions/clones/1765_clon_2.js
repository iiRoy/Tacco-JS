function ProcessInput(rawData) {
    // Split the incoming data by newline characters to get an array of lines.
    let linesArray = rawData.split('\n');

    // Extract the first line and further split it by spaces to get individual tokens.
    const firstLineTokens = linesArray[0].split(' ');

    // Initialize a variable to hold the index where the value '0' is found.
    let zeroIndex = ''; // Using an empty string as an initial placeholder.

    // Iterate through the first five elements of the token array.
    for (let idx = 0; idx < 5; idx++) {
        // Check if the current token is numerically equal to zero.
        if (firstLineTokens[idx] == 0) {
            // If '0' is found, store its current index.
            // This will store the last occurrence if '0' appears multiple times within the first five.
            zeroIndex = idx;
        }
    }

    // Convert the stored index to an integer, add one (to make it 1-based), and print the result.
    console.log(parseInt(zeroIndex) + 1);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
