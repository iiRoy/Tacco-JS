function processInput(rawData) {
    // Split the raw input string by space to get individual arguments
    const parts = rawData.split(' ');

    // Parse the first part as an integer with base 10
    const numOne = parseInt(parts[0], 10);

    // Parse the second part as an integer with base 10
    const numTwo = parseInt(parts[1], 10);

    // Calculate the product of the two numbers and check if it's even or odd
    if ((numOne * numTwo) % 2 === 0) {
        // If the remainder when divided by 2 is 0, the product is even
        console.log('Even');
    } else {
        // Otherwise, the product is odd
        console.log('Odd');
    }
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
