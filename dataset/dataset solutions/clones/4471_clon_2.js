function ComputeSum(orderedElements, totalCount, selectionSize) {
    // Initialize an accumulator for the sum of selected elements.
    let accumulatedValue = 0;

    // Iterate backwards from 'totalCount' down to 'totalCount - selectionSize + 1'.
    // This loop structure directly mirrors the original's iteration pattern.
    for (let idx = totalCount; idx > totalCount - selectionSize; idx--) {
        // Add the element at the current index to the running total.
        accumulatedValue += orderedElements[idx];
    }

    // Return the final computed sum.
    return accumulatedValue;
}

// A utility function for comparing two numbers to facilitate ascending sort.
function numericOrder(valA, valB) {
    // Returns a negative value if valA < valB, zero if equal, positive if valA > valB.
    return valA - valB;
}

// This function takes an array of string representations of numbers,
// converts them to integers, and then sorts them numerically.
function ProcessAndOrder(inputStrings) {
    // First, map each string item to its integer equivalent (base 10).
    // Then, sort the resulting array of numbers using the custom numeric comparison.
    return inputStrings.map(function(currentString) {
        return parseInt(currentString, 10);
    }).sort(numericOrder);
}

// The primary execution function that orchestrates input processing, calculation, and output.
function ExecuteProgram(rawData) {
    // Split the entire raw input string into an array of lines.
    let processedInputLines = rawData.split("\n");

    // Divide the first line into individual parts based on space delimiters.
    let firstLineParts = processedInputLines[0].split(" ");
    // Divide the second line into individual parts based on space delimiters.
    let secondLineParts = processedInputLines[1].split(" ");

    // Parse the array length from the second element of the first line.
    let arrayLength = parseInt(firstLineParts[1], 10);
    // Parse the 'importantValue' (k) from the third element of the first line.
    let importantValue = parseInt(firstLineParts[2], 10);

    // Perform the following steps:
    // 1. Process and sort the elements from the second line of input.
    // 2. Calculate the sum of the last 'importantValue' elements from the sorted array,
    //    using 'arrayLength' as the starting index for the backward iteration.
    // 3. Print the final computed sum to the standard output.
    console.log(ComputeSum(ProcessAndOrder(secondLineParts), arrayLength, importantValue));
}

// Read the entire content of the standard input file synchronously,
// decode it as UTF-8, and pass it to the main program execution function.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
