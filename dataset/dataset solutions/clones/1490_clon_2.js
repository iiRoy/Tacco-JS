(async () => {
    // Initialize a string to accumulate all standard input data.
    let rawData = '';
    // Asynchronously read data chunks from standard input until EOF.
    for await (const dataPiece of process.stdin) {
        rawData += dataPiece;
    }

    // Split the accumulated raw data into an array of lines.
    const inputRows = rawData.split(/\n/);

    // Parse the first line to extract the array size and the number of operations.
    const [arraySize, numQueries] = inputRows[0].split(/\s/).map(valStr => +valStr);

    // Parse the subsequent lines to create a list of operations.
    const operationList = inputRows.slice(1, numQueries + 1).map(opRow =>
        opRow.split(/\s/).map(valStr => +valStr)
    );

    // Initialize the primary array with '1's, based on the determined size.
    let targetArray = new Array(arraySize).fill(1);

    // Define the modulo constant used for calculations to prevent overflow.
    const moduloVal = 998244353;

    // Define a function to compute and output the current number represented by the array.
    const displayResult = () => {
        let currentNumber = 0; // Accumulator for the number being formed.
        // Iterate through the target array, building the number digit by digit.
        for (let idx = 0; idx < arraySize; idx++) {
            currentNumber = (currentNumber * 10 + targetArray[idx]) % moduloVal;
        }
        // Print the final calculated number to the console.
        console.log(currentNumber);
    };

    // Process each operation in the list of operations.
    for (const currentOp of operationList) {
        // Destructure the current operation into its components: left index, right index, and digit value.
        const [leftBound, rightBound, digitValue] = [currentOp[0] - 1, currentOp[1] - 1, currentOp[2]];

        // Apply the digit value to the specified range within the target array.
        for (let arrIdx = leftBound; arrIdx <= rightBound; arrIdx++) {
            targetArray[arrIdx] = digitValue;
        }
        // After modifying the array, call the function to display the new result.
        displayResult();
    }

})();
