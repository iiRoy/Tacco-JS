// This function handles the entire input data provided as a single string.
function ProcessInputData(rawInputText) {
    // Determine the total number of elements from the first line of the input.
    var itemCount = parseInt(rawInputText.split("\n")[0]);
    // Extract the space-separated numeric strings from the second line of the input.
    var numericStrings = rawInputText.split("\n")[1].split(" ");

    // Initialize an array to store the computed binary state for each position.
    var computedState = new Array(itemCount);
    // Prepare an array to collect indices that satisfy a specific condition.
    var relevantIndices = [];

    // Iterate backwards through the elements, starting from the total count down to one.
    for (var currentPosition = itemCount; currentPosition > 0; currentPosition--) {
        // Reset the temporary sum for each outer loop iteration.
        var cumulativeSum = 0;
        // Inner loop: calculate a sum based on multiples of the current position.
        for (var iterationFactor = 2; currentPosition * iterationFactor < itemCount; iterationFactor++) {
            cumulativeSum += computedState[currentPosition * iterationFactor];
        }

        // Compute the binary state for the current position (currentPosition - 1)
        // by summing the cumulativeSum and the parsed value from numericStrings, then taking modulo 2.
        computedState[currentPosition - 1] = (cumulativeSum + parseInt(numericStrings[currentPosition - 1])) % 2;

        // If the computed state for this position is 1, add its original index to the collection.
        if (computedState[currentPosition - 1] === 1) {
            relevantIndices.push(currentPosition);
        }
    }

    // Output the total count of relevant indices found.
    console.log(relevantIndices.length);
    // If there are any relevant indices, print them joined by a space.
    if (relevantIndices.length) {
        console.log(relevantIndices.join(" "));
    }
}

// The following section handles standard input/output and should not be altered by external processes.
// It reads the entire content from standard input and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));