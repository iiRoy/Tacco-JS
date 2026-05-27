process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = [];
const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (currentLine) => {
    // Store each incoming line of data
    inputBuffer.push(currentLine);
});

inputHandler.on('close', () => {
    // All input has been received, now process it
    const firstLineParts = inputBuffer[0].split(" ");
    let gridSize = Number(firstLineParts[0]); // Represents N from the problem
    let iterations = Number(firstLineParts[1]); // Represents K from the problem

    let currentValues = inputBuffer[1].split(" "); // Array 'A' from the problem, initially strings
    let nextValues = new Array(gridSize); // Array 'B' from the problem

    let outerLoopIdx = 0; // Counter for the main iteration loop (i)
    let rowIdx = 0;       // Counter for the inner row loop (j)
    let colIdx = 0;       // Counter for the innermost column loop (k)
    let updateIdx = 0;    // Counter for updating the array (l)

    // Execute the main algorithm for a specified number of iterations
    for (outerLoopIdx = 0; outerLoopIdx < iterations; outerLoopIdx++) {
        // Calculate the next state of values
        for (rowIdx = 0; rowIdx < gridSize; rowIdx++) {
            nextValues[rowIdx] = 0; // Initialize the current element of the next state array
            // Sum contributions from all elements in the current state
            for (colIdx = 0; colIdx < gridSize; colIdx++) {
                // Check the condition based on absolute difference
                if (currentValues[colIdx] >= Math.abs(rowIdx - colIdx)) {
                    nextValues[rowIdx]++; // Increment if condition is met
                }
            }
        }
        // Update the current state with the newly calculated next state
        for (updateIdx = 0; updateIdx < gridSize; updateIdx++) {
            currentValues[updateIdx] = nextValues[updateIdx];
        }
    }
    // Output the first five elements of the final array, separated by spaces
    console.log(currentValues[0] + ' ' + currentValues[1] + ' ' + currentValues[2] + ' ' + currentValues[3] + ' ' + currentValues[4]);
});
