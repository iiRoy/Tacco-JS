// Function to compute the greatest common divisor (GCD) of two positive integers
// utilizing the efficient Euclidean algorithm.
// This implementation ensures robustness by handling absolute values and correctly
// identifies the GCD when one of the numbers is zero.
const findCommonDivisorPair = (valA, valB) => {
    // Convert inputs to their absolute values to ensure correct GCD calculation
    // for potentially negative or zero inputs, although problem context implies positive.
    const absoluteNum1 = Math.abs(valA);
    const absoluteNum2 = Math.abs(valB);

    // The base case for the Euclidean algorithm: if the second number is zero,
    // the GCD is the first number. Otherwise, recurse with the second number
    // and the remainder of the first divided by the second.
    return absoluteNum2 === 0 ? absoluteNum1 : findCommonDivisorPair(absoluteNum2, absoluteNum1 % absoluteNum2);
};

// Function to determine the greatest common divisor for an arbitrary list of integers.
// It processes the numbers iteratively, applying the binary GCD function.
function determineGCDOfNumbers(...inputNumberSequence) {
    // Guard clause: If no numbers are provided, a GCD cannot be meaningfully computed.
    // Returning 0 is a common convention for an empty set's GCD in some contexts,
    // or an error could be thrown. For this problem, it's always called with 3 numbers.
    if (inputNumberSequence.length === 0) {
        console.warn("determineGCDOfNumbers was invoked without any arguments. Returning 0 as a default.");
        return 0;
    }

    // If only a single number is provided, its GCD is simply its absolute value.
    if (inputNumberSequence.length === 1) {
        return Math.abs(inputNumberSequence[0]);
    }

    // Employ the 'reduce' method to sequentially calculate the GCD.
    // This functional approach iterates through the array, accumulating the GCD
    // of the current value and the next value in the sequence.
    const finalCalculatedGCD = inputNumberSequence.reduce((currentAccumulator, nextNumberInSequence) => {
        return findCommonDivisorPair(currentAccumulator, nextNumberInSequence);
    });

    return finalCalculatedGCD;
}

// Define the source path for standard input. Using a constant makes it easily configurable.
const standardInputFilePath = "/dev/stdin";

let rawFileContents; // Variable to store the data read from the input file.

// Utilize a try-catch block to gracefully handle potential errors during file system operations,
// such as the file not existing or permission issues.
try {
    // Synchronously read the entire file content, assuming UTF-8 encoding.
    rawFileContents = require("fs").readFileSync(standardInputFilePath, "utf8");
} catch (readError) {
    // Log a detailed error message if file reading fails and terminate the process.
    console.error(`An error occurred while attempting to read from ${standardInputFilePath}: ${readError.message}`);
    // Exit with a non-zero status code to indicate that the program terminated abnormally.
    process.exit(1);
}

// The core logic of the application is encapsulated within a named function.
// This enhances modularity, readability, and makes the code easier to test.
const executeSummationOfGCDs = (processedTextContent) => {
    // Split the input text content into individual lines.
    const contentLinesCollection = processedTextContent.split('\n');

    // Helper function to parse and validate the K value from the input.
    // This adds a layer of robustness to the input processing.
    const parseAndValidateIterationLimit = (lineData) => {
        // Parse the string to an integer, explicitly specifying base 10.
        const parsedIntegerLimit = parseInt(lineData, 10);
        // Validate that the parsed value is a positive integer.
        if (isNaN(parsedIntegerLimit) || parsedIntegerLimit <= 0) {
            console.error("Input error: The first line must contain a positive integer for the iteration limit. Exiting.");
            process.exit(1); // Terminate if the limit is invalid.
        }
        return parsedIntegerLimit;
    };

    // Extract and validate the maximum iteration value (K) from the first line of input.
    const maximumIterationValue = parseAndValidateIterationLimit(contentLinesCollection[0]);

    // Initialize a variable to accumulate the sum of all computed GCDs.
    let cumulativeGCDSum = 0;

    // Optional feature: A flag to enable or disable progress logging, useful for debugging large inputs.
    const enableDetailedProgressLog = false;

    // Begin the triple-nested loop structure as required by the problem statement.
    // Each loop iterates from 1 up to the maximumIterationValue (K).
    for (let currentValX = 1; currentValX <= maximumIterationValue; currentValX++) {
        for (let currentValY = 1; currentValY <= maximumIterationValue; currentValY++) {
            for (let currentValZ = 1; currentValZ <= maximumIterationValue; currentValZ++) {
                // Calculate the GCD for the current triplet of (X, Y, Z) values.
                const gcdOfCurrentTriplet = determineGCDOfNumbers(currentValX, currentValY, currentValZ);
                // Add the result to the running total.
                cumulativeGCDSum += gcdOfCurrentTriplet;

                // Conditional logging for progress monitoring.
                if (enableDetailedProgressLog && currentValX === 1 && currentValY === 1 && currentValZ % 100000 === 0) {
                    // This log would show progress for every 100,000 iterations of the innermost loop
                    // when the outer loops are at their minimum values.
                    // console.log(`Debug: Iteration X=${currentValX}, Y=${currentValY}, Z=${currentValZ}. Current cumulative sum: ${cumulativeGCDSum}`);
                }
            }
        }
    }

    // Output the final computed sum in a descriptive format.
    console.log(`The grand total of all calculated GCDs is: ${cumulativeGCDSum}`);
};

// Initiate the main calculation process using the previously loaded file data.
executeSummationOfGCDs(rawFileContents);

// The script concludes here.