function processInputData(rawDataContent) {
    const lineSeparator = "\n";
    var linesOfCode = rawDataContent.split(lineSeparator);
    var currentProcessingIndex = 0;

    const terminationSentinel = "?";
    // The original loop condition checks if the '?' character exists anywhere in the array.
    // This condition is static as 'linesOfCode' is not modified within the loop.
    // If '?' is present, the loop will continue indefinitely or until an error occurs
    // due to 'eval' or an out-of-bounds access.
    const sentinelPresentInInput = linesOfCode.includes(terminationSentinel);

    while (sentinelPresentInInput) {
        // Retrieve the current line string from the array
        const lineToEvaluate = linesOfCode[currentProcessingIndex];

        // Evaluate the string as JavaScript code
        const evaluationOutcome = eval(lineToEvaluate);

        // Output the result of the evaluation
        console.log(evaluationOutcome);

        // Advance to the next line for processing
        currentProcessingIndex++;
    }
}

// Define the standard input file path
const standardInputFilePath = "/dev/stdin";

// Access the Node.js file system module
const fileSystemModule = require("fs");

// Read the entire content of the standard input file synchronously
const inputBuffer = fileSystemModule.readFileSync(standardInputFilePath, "utf8");

// Invoke the main data processing function with the obtained input
processInputData(inputBuffer);
