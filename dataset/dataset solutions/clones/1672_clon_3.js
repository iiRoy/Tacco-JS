"use strict";

// Utility function to safely retrieve and parse input from standard I/O
const acquireAndProcessInputData = () => {
    let rawDataStream;
    try {
        // Attempt to read the entire standard input synchronously
        rawDataStream = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        // If reading from /dev/stdin fails, log the error and terminate
        console.error(`Fatal input error: Unable to read from /dev/stdin. Details: ${ioError.message}`);
        process.exit(1);
    }

    // Split the raw input into an array of individual lines, removing any leading/trailing whitespace
    const segmentedInputLines = rawDataStream.trim().split("\n");

    // Validate that sufficient lines were provided for processing
    if (segmentedInputLines.length < 2) {
        console.error("Input format error: Expected at least two lines of input data.");
        process.exit(1);
    }

    // Parse the first line to determine the count of elements to consider
    // Use parseInt with radix 10 for explicit base handling
    const designatedElementCount = parseInt(segmentedInputLines[0].trim(), 10);

    // Validate the parsed count to ensure it's a non-negative integer
    if (isNaN(designatedElementCount) || designatedElementCount < 0) {
        console.error(`Input data error: Invalid element count '${segmentedInputLines[0].trim()}' specified.`);
        process.exit(1);
    }

    // Process the second line, splitting it by spaces and converting each part to a number
    // Filter out any empty strings that might result from multiple spaces
    const numericalValueSequence = segmentedInputLines[1].trim().split(" ").filter(segment => segment !== "").map(strValue => {
        const convertedNumber = Number(strValue);
        // Ensure all values in the sequence are valid numbers
        if (isNaN(convertedNumber)) {
            console.error(`Input data error: Non-numeric value '${strValue}' found in the sequence.`);
            process.exit(1);
        }
        return convertedNumber;
    });

    // Determine the actual number of elements to iterate over.
    // This ensures we don't go out of bounds if designatedElementCount is larger than the array's actual length.
    const effectiveIterationLimit = Math.min(designatedElementCount, numericalValueSequence.length);

    // Return the parsed and validated data structure
    return {
        targetLength: effectiveIterationLimit,
        dataArray: numericalValueSequence
    };
};

// Main program execution block
try {
    // Obtain the structured input data using the helper function
    const { targetLength, dataArray } = acquireAndProcessInputData();

    // Initialize a counter for specific conditions
    let oddValueAtEvenPositionAccumulator = 0; // Renamed 'ans'
    let currentPositionIndex = 0;             // Renamed 'i'

    // Iterate through the data array using a while loop (structural change from 'for')
    // Loop continues as long as the current index is within the effective limit
    while (currentPositionIndex < targetLength) {
        // Check if the current array index corresponds to an even position (0-indexed)
        const isPositionEven = (currentPositionIndex % 2 === 0);

        // Retrieve the numerical value at the current index
        const valueAtCurrentPosition = dataArray[currentPositionIndex];

        // Check if the retrieved value is an odd number
        // Using bitwise AND for parity check, which is an alternative to modulo
        const isValueOdd = ((valueAtCurrentPosition & 1) !== 0);

        // If both conditions are met, increment the accumulator
        if (isPositionEven && isValueOdd) {
            oddValueAtEvenPositionAccumulator++;
        }

        // Advance to the next position in the sequence
        currentPositionIndex++;
    }

    // Output the final computed count with a descriptive label
    console.log(`Final count of odd numbers at even positions: ${oddValueAtEvenPositionAccumulator}`);

} catch (mainExecutionError) {
    // Catch any unexpected errors during the main logic execution
    console.error(`Runtime error encountered: ${mainExecutionError.message}`);
    process.exit(1); // Indicate an error occurred
}