/*
 * This script processes standard input to calculate
 * the minimum, maximum, and sum of a sequence of numbers.
 */

// Ensure the standard input stream stays open for data reception.
process.stdin.resume();
// Configure the character encoding for the incoming data stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener to the standard input stream for 'data' events.
process.stdin.on('data',  function (receivedSegment) {
    // Split the entire received data block into an array of strings,
    // using the newline character as the delimiter.
    var parsedLines = receivedSegment.split("\n");

    // Initialize an empty string variable, 'computedResult', although it's not
    // utilized in the current logic flow for generating output.
    var computedResult = "";

    // Obtain the initial number of lines present in the 'parsedLines' array.
    var lineCount = parsedLines.length;

    // Iterate through the 'parsedLines' array to remove any empty string entries.
    // The loop variable 'lineIndex' is declared using 'let' for block scoping.
    for ( let lineIndex = 0; lineIndex < lineCount; lineIndex++ ) {
        // Check if the current line is an empty string.
        if (parsedLines[lineIndex] === "") {
            // If empty, remove this line from the array using 'splice'.
            parsedLines.splice(lineIndex, 1);
            // Decrement the 'lineCount' to reflect the removal.
            lineCount--;
            // Decrement 'lineIndex' as well, because removing an element shifts
            // subsequent elements, and the current index now points to a new element
            // that needs to be checked.
            lineIndex--;
        }
    }

    // Convert the first relevant line (after cleanup) into an integer,
    // representing the total quantity of numbers to process.
    var quantity = parseInt(parsedLines[0], 10);
    // Split the second relevant line into an array of string tokens,
    // using a space as the delimiter, representing the numerical input.
    var valueTokens = parsedLines[1].split(" ");

    // Initialize the variables for the smallest number, largest number,
    // and the running total using the first element of 'valueTokens'.
    // 'parseFloat' is used to convert the string to a floating-point number.
    var smallestNum = parseFloat(valueTokens[0]);
    var largestNum = parseFloat(valueTokens[0]);
    var cumulativeTotal = parseFloat(valueTokens[0]);

    // Begin iterating through the 'valueTokens' array starting from the second element
    // (index 1) up to the 'quantity' specified.
    // The loop variable 'k' is block-scoped with 'let'.
    for ( let k = 1; k < quantity; k++ ) {
        // Compare 'smallestNum' with the current numerical value from 'valueTokens'.
        // If the current value is smaller, update 'smallestNum'.
        if (smallestNum > parseFloat(valueTokens[k])) {
            smallestNum = parseFloat(valueTokens[k]);
        }

        // Compare 'largestNum' with the current numerical value from 'valueTokens'.
        // If the current value is larger, update 'largestNum'.
        if (largestNum < parseFloat(valueTokens[k])) {
            largestNum = parseFloat(valueTokens[k]);
        }

        // Add the current numerical value to 'cumulativeTotal'.
        cumulativeTotal += parseFloat(valueTokens[k]);
    }

    // Output the final calculated 'smallestNum', 'largestNum', and 'cumulativeTotal'
    // to the console, separated by spaces.
    console.log(smallestNum + " " + largestNum + " " + cumulativeTotal);
});