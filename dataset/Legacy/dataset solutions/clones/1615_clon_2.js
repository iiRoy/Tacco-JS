process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Main entry point for processing input data.
 * This function reads numerical values, calculates products of pairs,
 * and counts how many of these products are integers.
 * @param {string} rawData The complete input string from standard input.
 */
function ProcessInput(rawData) {
    // Divide the incoming raw string into individual lines.
    let lineData = rawData.split("\n");

    // The first line of input might contain configuration, but it's not utilized
    // in the final calculation logic. We parse it to maintain structural similarity
    // with the original code, but its value is effectively ignored.
    let _initialConfigValues = lineData[0].split(" ").map(Number);

    // Remove the first line from the array as it has been processed or is not needed
    // for the subsequent data.
    lineData.shift();

    // Convert the remaining lines into an array of floating-point numbers.
    let numericValues = lineData.map(itemStr => Number(itemStr));

    // Determine the total count of numerical entries in our processed array.
    let valueCount = numericValues.length;

    // This array was present in the original code but was commented out and unused.
    // It is declared here to preserve the original structure, even though it serves
    // no functional purpose in the current algorithm.
    let productStorage = new Array(valueCount);

    /*
     * The following block of code was commented out in the original implementation.
     * It appears to have been intended for calculating a running product of elements.
     * We retain it as a multi-line comment to reflect the exact structure of the source.
     *
     * productStorage[0] = numericValues[0];
     * for (let outerLoopIdx = 1; outerLoopIdx < valueCount; outerLoopIdx++) {
     *     productStorage[outerLoopIdx] = productStorage[outerLoopIdx - 1] * numericValues[outerLoopIdx];
     * }
     * console.log(productStorage);
     */

    // Initialize a counter to keep track of how many products result in an integer.
    let integerProductCount = 0;

    // Begin the outer loop, iterating through each number in the array.
    for (let outerIndex = 0; outerIndex < valueCount; outerIndex++) {
        // Start the inner loop from the current outer index. This ensures that
        // each pair is considered only once (e.g., (a,b) is the same as (b,a))
        // and also includes the product of a number with itself.
        for (let innerIndex = outerIndex; innerIndex < valueCount; innerIndex++) {
            // Calculate the product of the two numbers currently pointed to by the loops.
            let currentProduct = numericValues[outerIndex] * numericValues[innerIndex];

            // Check if the calculated product is an integer.
            if (Number.isInteger(currentProduct)) {
                // If the product is an integer, increment our counter.
                integerProductCount++;
            }
        }
    }

    // Output the final tally of integer products to the console.
    console.log(integerProductCount);
}

// Read all data from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// The following line was a commented-out test case in the original code.
// It is preserved here as a comment to maintain the original file's structure.
// ProcessInput("5\n7.5\n2.4\n17.000000001\n17\n16.000000000");
