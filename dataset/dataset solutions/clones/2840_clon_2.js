'use strict';
function ProcessInput(incomingData) {
    // This array will hold the parsed segments from the input string
    const dataSegments = incomingData.split(' ');

    // The first segment represents the total number of elements
    const totalItems = dataSegments[0];

    // The second segment represents the count of items to remove or offset
    const itemsToRemove = dataSegments[1];

    // Variable to store the computed result of our operation
    let finalOutcome;

    // Check a specific condition for the second value
    if (itemsToRemove == 1) {
        finalOutcome = 0; // If it's one, the outcome is zero
    }
    // Otherwise, perform a subtraction operation
    else {
        finalOutcome = totalItems - itemsToRemove;
    }

    // Output the final calculated value to the console
    console.log(finalOutcome);
}

/*
 * The following section is for handling standard input and should not be altered.
 * It reads the entire input from stdin and passes it to the main processing function.
 */
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );