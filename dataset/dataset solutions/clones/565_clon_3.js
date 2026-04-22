// This script continuously listens for input from the standard input stream.
// It is designed to process numerical entries, calculating the minimum number of coins
// required to make change for a specific target value.

// Ensure the standard input stream is active and ready to receive data.
process.stdin.resume();

// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Define the fixed monetary value from which change is to be calculated.
const REFERENCE_TRANSACTION_AMOUNT = 1000;

// Register an event handler for when data becomes available on the standard input.
process.stdin.on('data', (incomingDataBuffer) => {
    // Convert the raw buffer data to a string, then split it into individual lines.
    // Each line is trimmed to remove leading/trailing whitespace, and empty lines are filtered out.
    const processedInputLines = incomingDataBuffer.toString()
        .split('\n')
        .map(singleLine => singleLine.trim())
        .filter(trimmedLine => trimmedLine.length > 0);

    // Iterate through each valid, non-empty line of input.
    for (let lineIndex = 0; lineIndex < processedInputLines.length; ++lineIndex) {
        const currentInputStringValue = processedInputLines[lineIndex];

        // Attempt to parse the string input into a base-10 integer.
        const parsedNumericalValue = parseInt(currentInputStringValue, 10);

        // Perform validation on the parsed input:
        // - Check if it's a valid number.
        // - Ensure it's non-negative.
        // - Confirm it does not exceed the reference transaction amount.
        if (isNaN(parsedNumericalValue) || parsedNumericalValue < 0 || parsedNumericalValue > REFERENCE_TRANSACTION_AMOUNT) {
            console.error(`Invalid entry detected: '${currentInputStringValue}'. Expected a whole number between 0 and ${REFERENCE_TRANSACTION_AMOUNT}. Skipping this entry.`);
            continue; // Proceed to the next input line without further processing.
        }

        // If the input value is zero, no change is required.
        // The original logic implicitly skipped this by having an empty 'else' block.
        // We explicitly skip here for clarity.
        if (parsedNumericalValue === 0) {
            // console.log("Input value is zero, no change calculation performed.");
            continue; // Skip to the next input line.
        }

        // Calculate the amount of money that needs to be returned as change.
        let amountRemainingForChange = REFERENCE_TRANSACTION_AMOUNT - parsedNumericalValue;

        // Initialize counters for each coin denomination.
        let countOfFiveHundredYenCoins = 0;
        let countOfOneHundredYenCoins = 0;
        let countOfFiftyYenCoins = 0;
        let countOfTenYenCoins = 0;
        let countOfFiveYenCoins = 0;
        let countOfOneYenCoins = 0;

        // Determine the number of each coin type, starting from the largest denomination,
        // and update the remaining amount accordingly.

        // Calculate 500-yen coins
        countOfFiveHundredYenCoins = Math.floor(amountRemainingForChange / 500);
        amountRemainingForChange %= 500; // Update remaining amount

        // Calculate 100-yen coins
        countOfOneHundredYenCoins = Math.floor(amountRemainingForChange / 100);
        amountRemainingForChange %= 100; // Update remaining amount

        // Calculate 50-yen coins
        countOfFiftyYenCoins = Math.floor(amountRemainingForChange / 50);
        amountRemainingForChange %= 50; // Update remaining amount

        // Calculate 10-yen coins
        countOfTenYenCoins = Math.floor(amountRemainingForChange / 10);
        amountRemainingForChange %= 10; // Update remaining amount

        // Calculate 5-yen coins
        countOfFiveYenCoins = Math.floor(amountRemainingForChange / 5);
        amountRemainingForChange %= 5; // Update remaining amount

        // The final remainder represents the 1-yen coins.
        countOfOneYenCoins = amountRemainingForChange; // No need for Math.floor, as it's an integer remainder.

        // Sum all the calculated coin counts to get the total number of coins.
        const totalNumberOfCoinsIssued =
            countOfFiveHundredYenCoins +
            countOfOneHundredYenCoins +
            countOfFiftyYenCoins +
            countOfTenYenCoins +
            countOfFiveYenCoins +
            countOfOneYenCoins;

        // Output the total count of coins to the standard output.
        console.log(totalNumberOfCoinsIssued);
    }
});

// Optional: An event listener for when the standard input stream ends.
// process.stdin.on('end', () => {
//     // console.log("End of input stream detected. All data processed.");
//     // No specific action required for this problem on stream end.
// });