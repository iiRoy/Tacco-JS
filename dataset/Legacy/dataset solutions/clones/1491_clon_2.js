(async () => {
    // This asynchronous function processes input from standard input
    // and performs a series of operations based on the provided queries.

    let rawData = ''; // Accumulator for incoming data chunks
    for await (const dataPiece of process.stdin) {
        rawData += dataPiece; // Append each chunk to the raw data string
    }

    const inputLines = rawData.split(/\n/); // Split the accumulated data into individual lines

    // Parse the first line to get the array size and number of queries
    const [arraySize, numQueries] = inputLines[0].split(/\s/).map(valStr => +valStr);

    // Parse the subsequent lines to extract query details
    const operations = inputLines.slice(1, numQueries + 1).map(opLine =>
        opLine.split(/\s/).map(valStr => +valStr)
    );

    // Initialize an array of 'arraySize' elements, all set to 1
    let valueArray = new Array(arraySize).fill(1);

    const moduloVal = 998244353; // Define the modulus for all calculations
    let currentResult = 0; // Initialize the main result accumulator

    // Calculate the initial 'currentResult' based on 'arraySize'
    // This effectively creates a number consisting of 'arraySize' ones, modulo 'moduloVal'
    for (let idx = 0; idx < arraySize; idx++) {
        currentResult = (currentResult * 10 + 1) % moduloVal;
    }

    // Process each operation (query)
    for (const currentOp of operations) {
        // Destructure the current operation into its components: left bound, right bound, and digit value
        const [leftBound, rightBound, digitVal] = [currentOp[0] - 1, currentOp[1] - 1, currentOp[2]];

        let tempSum = 0; // Temporary sum for the current operation

        // Apply the digit value to the specified range [leftBound, rightBound]
        for (let idx = leftBound; idx <= rightBound; idx++) {
            // Update tempSum based on the difference between new digit and old value
            tempSum = (tempSum * 10 + digitVal - valueArray[idx]) % moduloVal;
            valueArray[idx] = digitVal; // Update the array element
        }

        // For elements beyond the right bound, continue multiplying tempSum by 10
        // to account for their positional value in the number
        for (let idx = rightBound + 1; idx < arraySize; idx++) {
            tempSum = (tempSum * 10) % moduloVal;
        }

        // Add the calculated tempSum to the overall currentResult
        currentResult += tempSum;
        currentResult %= moduloVal; // Ensure currentResult stays within the modulo range

        console.log(currentResult); // Output the updated result for the current operation
    }
})();
