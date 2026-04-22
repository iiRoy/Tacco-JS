// This function processes incoming text data to calculate a specific sum.
function ProcessInputData(receivedText) {
    "use strict"; // Enforce stricter parsing and error handling for cleaner code.

    // Split the entire input string into individual lines based on newline characters.
    const parsedLines = receivedText.split("\n");

    // Extract the first numeric value, representing an initial count or identifier.
    const initialCount = parseInt(parsedLines.shift(), 10);

    // Process the next line: split by spaces, then convert each segment to an integer.
    const numericalArray = parsedLines.shift().split(" ").map(elementValue => parseInt(elementValue, 10));

    // Initialize a new list with the first element from the processed numerical array.
    let constructedList = [numericalArray[0]];

    // Iterate through each number in the main numerical array.
    numericalArray.forEach(currentNumber => {
        // Retrieve and remove the last item from the constructed list.
        const previousItem = constructedList.pop();

        // Compare the retrieved item with the current number from the iteration.
        if (previousItem > currentNumber) {
            // If the previous item is larger, add the current number twice.
            constructedList.push(currentNumber);
            constructedList.push(currentNumber);
        } else {
            // Otherwise, re-add the previous item, then add the current number.
            constructedList.push(previousItem);
            constructedList.push(currentNumber);
        }
    });

    // Calculate the total sum of all elements currently in the constructed list.
    let cumulativeSum = constructedList.reduce((aggregate, currentVal) => aggregate + currentVal, 0);

    // Display the final calculated sum to the console.
    console.log(cumulativeSum);
}

/*
 * The following lines are for standard input/output handling.
 * Please do not modify this section to ensure proper execution.
 */
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));