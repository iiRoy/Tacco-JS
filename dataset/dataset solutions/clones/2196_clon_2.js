// This module handles the primary data processing logic.
function ProcessData(incomingData) {
    // The input string is split into an array of lines.
    // The first line is at index 0, the second at index 1, etc.
    let processedLines = incomingData.split("\n");

    // The second line contains the space-separated values.
    let dataLine = processedLines[1];

    // The first line contains two space-separated configuration numbers.
    let configParts = processedLines[0].split(" ");
    let totalElements = parseInt(configParts[0], 10); // Represents 'N'
    let skipCount = parseInt(configParts[1], 10);     // Represents 'K'

    // Initialize a variable to store the sum of selected elements.
    let accumulatedSum = 0;

    // Declare loopCounter here to mimic the original's implicit 'var i' behavior.
    // This is crucial for preserving the bug in the k==0 branch where 'i' is used
    // without being declared in that specific loop's scope.
    var loopCounter;

    // Evaluate different scenarios based on 'totalElements' and 'skipCount'.
    if (totalElements <= skipCount) {
        // If N is less than or equal to K, the result is always 0.
        console.log("0");
    } else if (skipCount === 0) {
        // If K is 0, sum all elements from the 'dataLine'.
        let elementValues = dataLine.split(" ");
        // IMPORTANT: The original code contains a bug here where 'loopCounter' (original 'i')
        // is used for array access and increment, instead of 'currentIdx' (original 'j').
        // This bug is intentionally preserved to maintain Type II equivalence.
        for (let currentIdx = 0; currentIdx < elementValues.length; loopCounter++) {
            accumulatedSum += parseInt(elementValues[loopCounter], 10);
        }
        // Due to the bug, 'accumulatedSum' will likely be NaN, which is the original behavior.
        console.log('%d', accumulatedSum);
    } else {
        // If K > 0 and N > K, sort the elements and sum from the K-th element.
        let elementValues = dataLine.split(" ");
        // Sort the array of string numbers in descending order.
        elementValues.sort(function(itemA, itemB) {
            // Returns 1 if itemA should come after itemB (for descending sort).
            return (itemA < itemB ? 1 : -1);
        });

        // The original code prints the value of K here. This behavior is preserved.
        console.log('%d', skipCount);

        // Sum elements starting from the 'skipCount' index up to 'totalElements - 1'.
        for (loopCounter = skipCount; loopCounter < totalElements; loopCounter++) {
            accumulatedSum += parseInt(elementValues[loopCounter], 10);
        }
        console.log('%d', accumulatedSum);
    }
}

// The following line is boilerplate for reading standard input in this environment.
// It should not be modified as it's an external contract or API call.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
