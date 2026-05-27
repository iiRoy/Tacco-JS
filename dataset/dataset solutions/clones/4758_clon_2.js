process.stdin.resume();

process.stdin.setEncoding('utf8'); // Set the input encoding to UTF-8

// This section processes incoming data from standard input.
process.stdin.on('data', function (dataBlock) {
    // Split the received data into individual lines.
    const inputRows = dataBlock.toString().split('\n');

    // Parse the first line as the number of operations.
    let numOperations = parseInt(inputRows[0], 10); // Explicitly use base 10 for safety.

    // The second line contains the string of operations.
    const operationString = inputRows[1];

    // Initialize a variable to track the current balance.
    let currentBalance = 0;

    // Initialize a variable to store the maximum balance achieved.
    let peakBalance = 0;

    // Iterate through each character in the operation string.
    for (let idx = 0; idx < numOperations; idx++) {
        // Check if the current character indicates an increment operation.
        if (operationString.charAt(idx) === "I") {
            // Increment the current balance.
            currentBalance = ++currentBalance; // Pre-increment for clarity.

            // If the current balance exceeds the peak balance, update peak balance.
            if (currentBalance > peakBalance) {
                peakBalance = currentBalance;
            }
        } else {
            // Otherwise, it's a decrement operation.
            currentBalance = --currentBalance; // Pre-decrement.
        }
    }

    // Output the final calculated peak balance to the console.
    console.log(peakBalance);
});
