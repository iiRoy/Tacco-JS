const executeLogic = (rawInput) => {
    // Convert the provided input value into its string representation.
    const inputRepresentation = String(rawInput);

    // Extract the last character of the string and parse it as an integer.
    let finalDigit = Number(inputRepresentation[inputRepresentation.length - 1]);

    // Evaluate the final digit against various predefined categories.
    if ([2, 4, 5, 7, 9].includes(finalDigit)) {
        console.log('hon'); // Output 'hon' for digits 2, 4, 5, 7, 9.
    } else if ([0, 1, 6, 8].includes(finalDigit)) {
        console.log('pon'); // Output 'pon' for digits 0, 1, 6, 8.
    } else if (finalDigit === 3) {
        console.log('bon'); // Output 'bon' specifically for the digit 3.
    }
};

// Read the content from standard input and pass it to the main processing function.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
