function ProcessData(rawDataInput) {
    // This function handles the entire processing of the provided raw input data.
    // It parses various numerical sequences and calculates a final score based on specific conditions.
    const linesOfData = rawDataInput.split("\n")
    ;

    // The initial element of the input typically represents the total count of items.
    // It's crucial to convert this string representation into a numerical type for proper iteration.
    let itemCount = Number(linesOfData[0]);

    // The second line contains a primary sequence of indices. Each string needs to be converted to a number.
    const sequenceIndices = linesOfData[1]
        .split(" ")
        .map((numericalString) => Number(numericalString))
    ;

    // The third line provides a set of base values. These are also parsed into an array of numbers.
    const valueSetB = linesOfData[2].split(" ").map((strVal) => Number(strVal));

    // The fourth line contains a set of bonus values, parsed similarly into an array of numbers.
    const bonusSetC = linesOfData[3].split(" ").map((bonusStr) => Number(bonusStr));

    // Initialize a variable to accumulate the final result.
    let totalScore = 0;

    // Iterate through the primary sequence of indices.
    // The loop runs from the first element up to, but not including, the 'itemCount'.
    for (let idx = 0; idx < itemCount; idx++) {
        // Add the corresponding base value from 'valueSetB'.
        // Note: The input indices are typically 1-based, requiring a '-1' adjustment for 0-based array access.
        totalScore += valueSetB[sequenceIndices[idx] - 1];

        // Check for a specific condition involving consecutive indices.
        // This condition applies only from the second element onwards (idx > 0) to prevent accessing 'sequenceIndices[-1]'.
        if (idx > 0 && sequenceIndices[idx] === sequenceIndices[idx - 1] + 1) {
            // If the condition is met, add a bonus value from 'bonusSetC'.
            // The bonus is determined by the *previous* index in the sequence.
            totalScore += bonusSetC[sequenceIndices[idx - 1] - 1];
        }
    }

    // Output the final computed score to the standard console.
    console.log(totalScore);
}

// This is the entry point for executing the script.
// It reads all content from standard input (typically '/dev/stdin' in competitive programming contexts)
// as a UTF-8 encoded string and passes it to the main processing function.
const fileContentLoader = require("fs");
ProcessData(fileContentLoader.readFileSync("/dev/stdin", "utf8"));