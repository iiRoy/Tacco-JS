const UTIL_MODULE = require('readline'); // Import the readline utility for interactive input handling

// Establish standard input stream readiness and encoding.
// This ensures data is correctly interpreted as UTF-8 characters.
process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Array to accumulate all incoming lines from the standard input.
 * Each line read will be pushed into this collection.
 * @type {string[]}
 */
let capturedInputRows = [];

/**
 * Creates an interface for reading data from a readable stream (stdin)
 * one line at a time. It also directs output to stdout.
 * @type {UTIL_MODULE.Interface}
 */
const streamInputHandler = UTIL_MODULE.createInterface({
  input: process.stdin,  // Use standard input as the source
  output: process.stdout // Direct output to standard output
});

/**
 * Attaches an event listener for each 'line' event.
 * When a complete line is entered by the user and followed by a newline,
 * this callback is invoked, and the line is stored.
 * @param {string} currentSegment - The line of text just received from input.
 */
streamInputHandler.on('line', (currentSegment) => {
  capturedInputRows.push(currentSegment); // Store the received text row
});

/**
 * Custom utility function to determine if a BigInt value is even.
 * An even number is perfectly divisible by 2.
 * @param {BigInt} numberToCheck - The BigInt value to evaluate.
 * @returns {boolean} True if the BigInt is even, false otherwise.
 */
function isEvenBigInt(numberToCheck) {
  // Check if the remainder after division by 2n (BigInt 2) is 0n (BigInt 0)
  return numberToCheck % 2n === 0n;
}

/**
 * Finds the smallest BigInt value among a variable number of arguments.
 * This is a custom implementation as Math.min does not support BigInt.
 * @param {...BigInt} bigIntValues - A list of BigInt numbers.
 * @returns {BigInt} The smallest BigInt found among the arguments.
 * @throws {Error} If no arguments are provided.
 */
function determineMinimumBigInt(...bigIntValues) {
    if (bigIntValues.length === 0) {
        // Essential guard clause: Cannot find minimum of an empty set.
        throw new Error("Cannot determine minimum for an empty set of BigInt values.");
    }

    let currentSmallest = bigIntValues[0]; // Initialize with the first value

    // Iterate through the remaining values to find a smaller one
    for (let index = 1; index < bigIntValues.length; index++) {
        const potentialSmallest = bigIntValues[index];
        if (potentialSmallest < currentSmallest) {
            currentSmallest = potentialSmallest; // Update if a smaller value is found
        }
    }
    return currentSmallest; // Return the overall smallest BigInt
}

/**
 * Attaches an event listener for the 'close' event.
 * This callback executes once the input stream is closed (e.g., by EOF signal).
 * It contains the primary logic for processing the collected input.
 */
streamInputHandler.on('close', () => {
    // Ensure we have at least one line of input to process.
    if (capturedInputRows.length === 0) {
        console.error("Error: No input lines were provided.");
        return; // Exit if no input to prevent errors
    }

    // Split the first line of input into string components based on spaces.
    const rawStringComponents = capturedInputRows[0].split(" ");

    // Input validation: Expecting exactly three numerical components.
    if (rawStringComponents.length !== 3) {
        console.error("Error: Expected exactly three space-separated numbers on the first line.");
        return; // Exit if input format is incorrect
    }

    // Parse the string components into BigInt values for arbitrary precision arithmetic.
    const parsedNumericalValues = rawStringComponents.map(item => BigInt(item));

    // Destructure the three BigInt values for easier access.
    const [valX, valY, valZ] = parsedNumericalValues;

    // Determine if any of the three BigInts are even.
    // This is a critical check for the problem's logic.
    const anyEvenFound = isEvenBigInt(valX) || isEvenBigInt(valY) || isEvenBigInt(valZ);

    if (anyEvenFound) {
        // If any number is even, the specific problem condition dictates the result is 0.
        console.log(0);
    } else {
        // If all numbers are odd, proceed with calculating the products and finding the minimum.

        // Calculate the three possible pairwise products using BigInt arithmetic.
        const productXY = valX * valY;
        const productYZ = valY * valZ;
        const productXZ = valX * valZ;

        // Find the smallest among these three BigInt products.
        const lowestProduct = determineMinimumBigInt(productXY, productYZ, productXZ);

        // Convert the final BigInt result to its string representation before printing.
        console.log(lowestProduct.toString());
    }
});