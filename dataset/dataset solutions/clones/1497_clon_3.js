function solveProblemLogic(inputPayload) {
    // This function processes the raw input string to determine a specific sequence length.
    // It calculates the smallest integer 'k' such that the cumulative sum of integers
    // from 1 up to 'k' is perfectly divisible by a given target number 'N'.
    // A particular condition related to the 'k' value itself is also applied.

    // Validate the input payload to ensure it's a non-empty string.
    if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
        console.error("Error: The provided input payload is either empty or not a valid string.");
        return; // Terminate execution if input is invalid.
    }

    // Split the input string into individual lines.
    const separatedLines = inputPayload.split("\n");
    if (separatedLines.length === 0 || separatedLines[0].trim().length === 0) {
        console.error("Error: No meaningful data found in the first line of input.");
        return;
    }

    // Extract the first line and then segment it by spaces.
    const firstLineSegments = separatedLines[0].split(" ");
    if (firstLineSegments.length === 0) {
        console.error("Error: The first line contains no segments.");
        return;
    }

    // The target divisor 'N' is expected to be the first numeric value on the first line.
    const stringValueN = firstLineSegments[0];
    const targetDivisor = parseInt(stringValueN, 10); // Convert string to integer.

    // Perform robust validation on the parsed target divisor.
    if (isNaN(targetDivisor) || !Number.isInteger(targetDivisor) || targetDivisor <= 0) {
        console.error(`Error: Invalid target divisor detected. Expected a positive integer, but received "${stringValueN}".`);
        return; // Exit if 'N' is not a valid positive integer.
    }

    // Initialize key variables for the iterative summation process.
    let currentAccumulatedSum = 0;       // This variable will hold the sum (1 + 2 + ... + currentSequenceNumber).
    let loopIterationCount = 0;          // This counter will ultimately store the value of 'k'.
    let currentSequenceNumber = 1;       // This variable represents the 'i' in the original 'for' loop (1, 2, 3, ...).

    // A boolean flag to control the execution of the main computational loop.
    let shouldContinueLooping = true;

    // The primary loop that calculates the sum of consecutive integers and checks the termination condition.
    while (shouldContinueLooping) {
        // Add the current number in the sequence to the running total.
        currentAccumulatedSum += currentSequenceNumber;
        // Increment the iteration counter, which is our candidate for 'k'.
        loopIterationCount++;

        // Evaluate the first part of the termination condition: Is the sum divisible by the target?
        const isSumPerfectlyDivisible = (currentAccumulatedSum % targetDivisor === 0);
        // Evaluate the second part: Is the current sequence number not the very first one (i.e., not 1)?
        // This specific check is crucial to replicate the exact behavior of the original problem statement.
        const isNotTheInitialSequenceElement = (currentSequenceNumber !== 1);

        // If both conditions are met, it's time to stop the computation.
        if (isSumPerfectlyDivisible && isNotTheInitialSequenceElement) {
            shouldContinueLooping = false; // Set the flag to exit the loop on the next iteration check.
        }

        // Prepare for the next iteration by incrementing the sequence number.
        currentSequenceNumber++;
    }

    // Output the final computed iteration count, which is the desired 'k'.
    console.log(loopIterationCount);
}

// This immediately-invoked function expression serves as the application's entry point.
// It handles the environment-specific aspects of reading input and initiating the core logic.
(function executeSolution() {
    // Obtain a reference to the Node.js file system module.
    const fileSystemModule = require('fs');
    // Define the standard path for reading input in typical competitive programming setups.
    const standardInputFilePath = '/dev/stdin';
    // Specify the character encoding to use when reading the input file.
    const inputFileEncoding = 'utf8';

    try {
        // Synchronously read the entire content from the standard input file.
        const receivedInputData = fileSystemModule.readFileSync(standardInputFilePath, inputFileEncoding);
        // Pass the raw input string to the main problem-solving function.
        solveProblemLogic(receivedInputData);
    } catch (executionError) {
        // Catch and log any errors that occur during file reading or the main logic execution.
        console.error("An unhandled error occurred during the solution execution:", executionError.message);
        // Depending on requirements, a specific error code or default output could be provided here.
    }
})();