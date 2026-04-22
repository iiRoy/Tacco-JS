(async function executeOperations() {
    let rawData = '';

    // Asynchronously gather all incoming data segments from standard input
    for await (const dataSegment of process.stdin) {
        rawData += dataSegment;
    }

    // Process the accumulated data, splitting it into individual lines
    const textRows = rawData.split(/\n/);

    // Extract the primary configuration values: the size of the sequence and the number of commands
    const [arraySize, operationCount] = textRows[0].split(/\s/).map(valString => +valString);

    // Parse all subsequent lines to form a list of command specifications
    const commandList = textRows.slice(1, operationCount + 1).map(currRow => currRow.split(/\s/).map(valString => +valString));

    // Initialize the main numeric sequence with '1's, sized according to 'arraySize'
    let numericSequence = new Array(arraySize).fill(1);

    // Define the modulo constant for all numeric operations
    const divisorValue = 998244353;

    // This helper function computes the numeric value represented by 'numericSequence'
    // and outputs it to the console, applying the 'divisorValue' modulo.
    const displayResult = () => {
        let currentNumber = 0; // Accumulator for the calculated number
        for (let idx = 0; idx < arraySize; ++idx) { // Iterate through each element
            currentNumber = (currentNumber * 10 + numericSequence[idx]) % divisorValue; // Build number and apply modulo
        }
        console.log(currentNumber); // Present the final result
    };

    // Iterate through each command in the prepared list
    for (const currentCommand of commandList) {
        // Deconstruct the command into its respective bounds and the digit to apply,
        // adjusting the bounds for zero-based indexing
        const [leftBound, rightBound, digitToSet] = [currentCommand[0] - 1, currentCommand[1] - 1, currentCommand[2]];

        // Apply the specified digit replacement across the defined range within the sequence
        for (let idx = leftBound; idx <= rightBound; ++idx) {
            numericSequence[idx] = digitToSet; // Update the sequence element
        }

        // After each command execution, re-evaluate and display the sequence's numeric value
        displayResult();
    }
})();