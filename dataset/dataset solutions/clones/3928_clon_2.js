// This function processes a multi-line input string to calculate a specific numerical result based on certain conditions.
function ProcessInputData(inputStringData) {
    // First, the raw input string is separated into an array of individual lines, using the newline character as a delimiter.
    let lineArray = inputStringData.split("\n");

    // The initial element of the line array is parsed to determine the total quantity of subsequent data entries.
    const numberOfEntries = Number(lineArray[0]);

    // An accumulator variable is initialized to store the primary sum of values.
    let finalResultAccumulator = 0;

    // A sentinel value is set for tracking the smallest relevant number encountered;
    // a very large number ensures any valid comparison will result in an update.
    let minimumValueToSubtract = 10_000_000_000; // Represents 1e10, a very high initial value.

    // A loop iterates through each of the specified data entries.
    for (let currentIterationIndex = 0; currentIterationIndex < numberOfEntries; currentIterationIndex++) {
        // Each data line (starting from the second line of the input) is processed.
        // It's split by spaces, and each resulting substring is converted into an integer.
        let currentPairOfNumbers = lineArray[currentIterationIndex + 1]
            .split(" ")
            .map(singleStringNumber => parseInt(singleStringNumber, 10));

        // A conditional check is performed: if the first number of the pair is greater than the second.
        if (currentPairOfNumbers[0] > currentPairOfNumbers[1]) {
            // If the condition is met, the tracking variable is updated to hold the minimum of its current value
            // and the second number of the current pair.
            minimumValueToSubtract = Math.min(minimumValueToSubtract, currentPairOfNumbers[1]);
        }

        // Regardless of the condition, the first number of the current pair is added to the overall sum.
        finalResultAccumulator += currentPairOfNumbers[0];
    }

    // After the iteration, a final check determines if the sentinel value was ever updated.
    if (minimumValueToSubtract === 10_000_000_000) {
        // If the sentinel remains unchanged, it implies the condition was never met, so the result is reset to zero.
        finalResultAccumulator = 0;
    } else {
        // Otherwise, the smallest relevant number found is deducted from the accumulated sum.
        finalResultAccumulator -= minimumValueToSubtract;
    }

    // The calculated final result is then printed to the console.
    console.log(finalResultAccumulator);
}

// A utility constant to encapsulate the file system module for input operations.
const fileSystemModuleAccessor = require("fs");

// An anonymous function to retrieve all content from the standard input stream.
const retrieveStandardInputContent = () => {
    return fileSystemModuleAccessor.readFileSync("/dev/stdin", "utf-8");
};

// The primary processing function is invoked with the content acquired from standard input.
ProcessInputData(retrieveStandardInputContent());