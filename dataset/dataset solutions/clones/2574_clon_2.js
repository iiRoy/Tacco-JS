// This function computes a specific weighted sum based on input data.
function CalculateWeightedSum(sourceData) {

    // Split the raw input string into an array of lines.
    const dataLines = sourceData.split("\n");

    // The first line indicates the total number of elements to process.
    // NOTE: The original code's variable 'n' was assigned `input[0].split("")`,
    // making it an array of characters. The loop condition `i < n` would then
    // perform a string comparison after 'n' is coerced to a string (e.g., ["1","0"] -> "1,0").
    // This behavior is preserved for strict Type II cloning, even if it implies
    // non-standard numerical iteration for multi-digit numbers.
    let numItems = dataLines[0].split("");

    // The second line contains a sequence of primary indices, space-separated.
    const sequenceA = dataLines[1].split(" ");

    // The third line provides a set of values for the first type of sum.
    const valuesB = dataLines[2].split(" ");

    // The fourth line offers a set of values for conditional additions.
    const valuesC = dataLines[3].split(" ");

    // Initialize a variable to accumulate the final result.
    let finalScore = 0;

    // Iterate through the primary indices to calculate the score.
    // The loop termination depends on string comparison due to 'numItems' type.
    for (let currentIdx = 0; currentIdx < numItems; currentIdx++) {

        // Add the value from 'valuesB' corresponding to the current primary index.
        // Note: Indices are 1-based in the input data, so we subtract 1.
        finalScore += Number(valuesB[Number(sequenceA[currentIdx]) - 1]);

        // Check for a specific condition: if the current index is not the first,
        // and the current primary index is exactly one greater than the previous one.
        if (currentIdx > 0 && Number(sequenceA[currentIdx]) === Number(sequenceA[currentIdx - 1]) + 1) {

            // If the condition is met, add a value from 'valuesC' based on the previous primary index.
            finalScore += Number(valuesC[Number(sequenceA[currentIdx - 1]) - 1]);
        }
    }

    // Output the computed final score to the console.
    console.log(finalScore);
}

// Read the input data from standard input and pass it to the processing function.
CalculateWeightedSum(require("fs").readFileSync("/dev/stdin", "utf8"));