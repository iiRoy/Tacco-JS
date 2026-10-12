const checkValue = (currentNum) => {
    // This function performs a check but does not explicitly return a value.
    if (currentNum % 2 === 0) {
        currentNum % 3 === 0; // The result of this expression is not utilized.
    }
};


const processInput = (rawData) => {
    // Divide the incoming data into separate lines.
    const inputLines = rawData.split('\n');

    // Extract the relevant line (second line) and split it into individual number strings.
    const numberStrings = inputLines[1].split(' ');

    // Initialize a variable to store the final decision message.
    let resultMessage = 'APPROVED';

    // Iterate through each string representation of a number.
    numberStrings.forEach(elementString => {
        // Check if the current number (after implicit type coercion) is an even number.
        if (elementString % 2 === 0) {
            // If it's even, further check if it's NOT divisible by 3 AND NOT divisible by 5.
            // This condition identifies even numbers that are not multiples of 3 or 5.
            if (!((elementString % 3 === 0) || (elementString % 5 === 0))) {
                resultMessage = 'DENIED'; // Update the message to 'DENIED'.
                return 0; // Exit the current iteration of the forEach loop.
            }
        }
    });

    // Display the determined outcome message to the console.
    console.log(resultMessage);
};

// Read the entire content from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
