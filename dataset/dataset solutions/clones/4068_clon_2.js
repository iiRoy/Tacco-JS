function processInput(rawData) {
    // Divide the incoming string into separate components based on space.
    const parts = rawData.split(' ');

    // Convert the initial component to an integer, specifying base 10.
    const firstNum = parseInt(parts[0], 10);

    // Convert the subsequent component to an integer, also using base 10.
    const secondNum = parseInt(parts[1], 10);

    // Evaluate if the product of the two numbers is an even value.
    // An even number yields a remainder of zero when divided by two.
    if ((firstNum * secondNum) % 2 === 0) {
        // If the outcome is even, display the word 'Even'.
        console.log('Even');
    } else {
        // Otherwise, if the outcome is odd, display the word 'Odd'.
        console.log('Odd');
    }
}

// Obtain data from the standard input stream and pass it to the processing routine.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
