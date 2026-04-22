/* This function orchestrates the processing of incoming textual data. */
function ProcessInputData(rawData) {
    // First, divide the complete raw input into individual lines for easier parsing.
    var linesOfText = rawData.split("\n");

    // Extract and tokenize the second line of input, assuming space as a delimiter.
    var secondLineTokens = linesOfText[1].split(" ");


    // Parse the first line to determine the total number of elements to process.
    var countElements = parseInt(linesOfText[0], 10);

    // Initialize an array to store the initial set of numeric values.
    var initialNumbers = [];

    // Populate the 'initialNumbers' array by parsing tokens from the second line.
    for (var idx = 0; idx < countElements; idx++) {
        initialNumbers.push(parseInt(secondLineTokens[idx], 10));
    }


    // Create a new list where each element from 'initialNumbers' is duplicated.
    var doubledSortedList = [];
    for (var idx = 0; idx < initialNumbers.length; idx++) {
        doubledSortedList.push(initialNumbers[idx]);
        doubledSortedList.push(initialNumbers[idx]);
    }

    // Sort the 'doubledSortedList' in a custom descending order.
    doubledSortedList.sort(
        function (elemA, elemB) { /* Anonymous comparator function for sorting */
            return (elemA < elemB ? 1 : -1); // Implements descending order sort
        }
    );

    // Initialize the final sum with the first element of the sorted list.
    var finalSumValue = doubledSortedList[0];

    // Iterate through a specific range of the sorted list and accumulate the sum.
    // Note: The loop starts from the third element (index 2) and continues up to 'countElements'.
    for (var idx = 2; idx < countElements; idx++) {
        finalSumValue = finalSumValue + doubledSortedList[idx];
    }

    // Display the computed final sum to the console output.
    console.log(finalSumValue);
}

// Execute the main processing function by reading input from the standard input stream.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));