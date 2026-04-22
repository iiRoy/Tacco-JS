const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Buffer to accumulate all incoming lines from standard input.
const lineBuffer = [];

// Event handler for each line received.
inputProcessor.on('line', (currentLine) => {
    // Trim whitespace from the line and store it in our buffer.
    lineBuffer.push(currentLine.trim());
});

// Event handler when the input stream is closed.
inputProcessor.on('close', () => {
    // Check if any input was provided.
    if (lineBuffer.length === 0) {
        // If no input, log an error and terminate.
        console.error('Error: No input lines were provided.');
        process.exit(1);
    }

    // Retrieve the very first line of input for processing.
    const primaryInputString = lineBuffer[0];

    // Basic validation for the primary input string.
    if (!primaryInputString || primaryInputString.length === 0) {
        console.error('Error: The first input line is empty or invalid.');
        process.exit(1);
    }

    // Split the input string into individual components based on space.
    const dataTokens = primaryInputString.split(' ');

    // Ensure we have enough data tokens to extract the required numbers.
    // The problem implies at least 3 tokens, with the first being ignored.
    const MIN_REQUIRED_TOKENS = 3;
    if (dataTokens.length < MIN_REQUIRED_TOKENS) {
        console.error(`Error: Insufficient tokens in the input line. Expected at least ${MIN_REQUIRED_TOKENS}, got ${dataTokens.length}.`);
        process.exit(1);
    }

    // Parse the relevant numeric values from the tokens.
    // Explicitly converting to integers for safety.
    const firstNumericValue = parseInt(dataTokens[1], 10);
    const secondNumericValue = parseInt(dataTokens[2], 10);

    // Validate if the parsed values are indeed numbers.
    if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
        console.error('Error: Invalid numeric input. Please ensure the second and third tokens are valid numbers.');
        process.exit(1);
    }

    // Perform the core calculation: (second - first) - 1.
    // This represents the number of turns available in a game.
    const calculatedGap = secondNumericValue - firstNumericValue;
    const effectiveTurnsCount = calculatedGap - 1;

    // Determine the winner based on the parity of the effective turns count.
    // Alice wins if the count is odd, Borys wins if it's even.
    let gameResultRecipient;
    if (effectiveTurnsCount % 2 !== 0) {
        // If the remainder when divided by 2 is not 0, it's odd.
        gameResultRecipient = 'Alice';
    } else {
        // Otherwise, it's even.
        gameResultRecipient = 'Borys';
    }

    // Output the name of the determined winner.
    console.log(gameResultRecipient);
});