/*
 * This module processes raw text input to determine
 * if it contains the digit '9'.
 */
function ProcessInput( rawData ) {
    // Convert the raw input string into an array of integers (digits).
    // First, remove leading/trailing whitespace.
    // Then, split into individual characters.
    // Finally, map each character to its integer representation.
    const digitList = rawData
        .trim()
        .split('')
        .map( charVal => parseInt(charVal, 10) );

    // Initialize a counter for occurrences of the digit nine.
    let countNines = 0;

    // Iterate through each digit in the prepared list.
    for (let idx = 0; idx < digitList.length; idx++) {
        // Check if the current digit is equal to nine.
        if (digitList[idx] === 9) {
            // If it is, increment our counter.
            countNines = countNines + 1;
        } else {
            // If not, increment by zero (effectively doing nothing).
            countNines += 0;
        }
    }

    // After checking all digits, evaluate the total count.
    if (countNines !== 0) {
        // If '9' was found at least once, print an affirmative message.
        console.log('Affirmative');
    } else {
        // Otherwise, if '9' was not found, print a negative message.
        console.log('Negative');
    }
}

// Invoke the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));