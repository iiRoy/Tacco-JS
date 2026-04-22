// This array serves as a buffer to store each individual line of input received from the standard input stream.
let inputDataCollection = [];

// Import the 'readline' module, which provides an interface for reading data from a Readable stream
// (like process.stdin) one line at a time.
const lineInputProcessor = require('readline');

// Create an instance of the readline interface, linking it to standard input and output streams.
// This allows us to listen for incoming lines and manage the console interaction.
const streamInteractionHandler = lineInputProcessor.createInterface({
    input: process.stdin,  // Designates the source of incoming data as the standard input.
    output: process.stdout // Designates the destination for output data as the standard output.
});

// Configure an event listener to capture each line of text as it is entered.
// Every received line content is appended to our `inputDataCollection` array.
streamInteractionHandler.on('line', (currentLineContent) => {
    inputDataCollection.push(currentLineContent);
});

// Set up an event handler that triggers once the input stream has completely closed.
// This is where the core computational logic of the application will be executed.
streamInteractionHandler.on("close", () => {
    // Perform an initial validation: check if any input lines were actually received.
    if (inputDataCollection.length === 0) {
        console.error("Execution Aborted: No data lines were provided via standard input.");
        // Terminate the process with a non-zero exit code to signal an error.
        process.exit(1);
    }

    // Extract the very first line from our collected input segments.
    const primaryInputSegment = inputDataCollection[0];
    // Split this line by spaces to obtain potential numeric strings.
    const numericalComponents = primaryInputSegment.split(" ");

    // Validate that at least two numerical components are present on the first line.
    if (numericalComponents.length < 2) {
        console.error("Execution Aborted: The primary input line must contain at least two space-separated numbers.");
        process.exit(1);
    }

    // Parse the first two extracted components into base-10 integers.
    const initialOperandValue = parseInt(numericalComponents[0], 10);
    const terminalOperandValue = parseInt(numericalComponents[1], 10);

    // Further validation: ensure that both parsed values are indeed valid numbers.
    if (isNaN(initialOperandValue) || isNaN(terminalOperandValue)) {
        console.error("Execution Aborted: Invalid numeric data encountered in the first input line.");
        process.exit(1);
    }

    // Compute the absolute difference or 'gap' between the terminal and initial values.
    const computedSpanMagnitude = terminalOperandValue - initialOperandValue;

    // Define the maximum iteration limit for our summation process.
    const maxIterationCeiling = 999;

    // Initialize an array to store pre-calculated triangular numbers (cumulative sums).
    // The array is sized `maxIterationCeiling + 1` to accommodate 0-based indexing while
    // storing sums up to `maxIterationCeiling` at their corresponding index.
    let precomputedTriangularSums = new Array(maxIterationCeiling + 1).fill(0);

    // Introduce a running total variable to efficiently calculate cumulative sums within the loop.
    let currentCumulativeSum = 0;

    // Iterate from 1 up to the defined maximum ceiling.
    // In each step, we calculate the triangular number (1 + 2 + ... + currentNumber).
    for (let loopStepIdentifier = 1; loopStepIdentifier <= maxIterationCeiling; ++loopStepIdentifier) {
        currentCumulativeSum += loopStepIdentifier; // Add the current number to the running total.
        precomputedTriangularSums[loopStepIdentifier] = currentCumulativeSum; // Store this cumulative sum.

        // Check if the `computedSpanMagnitude` matches the current `loopStepIdentifier`.
        if (computedSpanMagnitude === loopStepIdentifier) {
            // If a match is found, calculate the final desired output.
            // This is the triangular sum for `computedSpanMagnitude` minus the `terminalOperandValue`.
            const finalResultOutput = precomputedTriangularSums[loopStepIdentifier] - terminalOperandValue;
            console.log(finalResultOutput); // Print the result to standard output.
            return; // Terminate the 'close' event handler as the required output has been generated.
        }
    }

    // If the loop completes without finding a match (meaning `computedSpanMagnitude` was not
    // within the range [1, maxIterationCeiling]), the original code would simply exit silently.
    // We maintain this behavior, implying no specific output is expected in such cases.
});