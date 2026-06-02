function processInput(rawData) {
    // Split the raw input string into an array of tokens
    let tokenizedData = rawData.split(' ');

    // Parse the first token as an integer, base 10
    const upperLimit = parseInt(tokenizedData[0], 10);

    // Initialize a counter for numbers with an odd number of digits
    let oddDigitCount = 0;

    // Loop from 1 up to and including the upper limit
    for (let currentNumber = 1; currentNumber <= upperLimit; currentNumber++) {
        // Convert the current number to a string to check its length
        // If the length of the string representation is odd, increment the counter
        if (String(currentNumber).length % 2 === 1) {
            oddDigitCount++; // Increment the counter
        }
    }

    // Output the final count to the console
    console.log(oddDigitCount);
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
