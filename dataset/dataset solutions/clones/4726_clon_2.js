// This primary function processes incoming raw text data.
function ProcessInputData(rawData) {
    // Declare and initialize two counters: one for odd integers and another for even integers.
    let oddCounter = 0;
    let evenCounter = 0;

    // Divide the entire input string into an array of distinct lines, using the newline character as a separator.
    const dataLines = rawData.split('\n');

    // The second line of the input contains a sequence of numbers separated by spaces.
    // Split this line to obtain an array of number-strings.
    const numericalStrings = dataLines[1].split(' ');

    // The very first line of the input indicates the total quantity of numbers to be evaluated.
    // Convert this string value to an actual numeric type.
    const quantityToProcess = Number(dataLines[0]);

    // Commence a loop that iterates through each numerical string up to the specified quantity.
    for (let currentIdx = 0; currentIdx < quantityToProcess; currentIdx++) {
        // Convert the current string representation of a number into a proper numeric value.
        const evaluatedNumber = Number(numericalStrings[currentIdx]);

        // Utilize the modulo operator to determine if the evaluated number is odd or even.
        if (evaluatedNumber % 2 !== 0) { // If the remainder is not zero, the number is odd.
            oddCounter++; // Increment the counter specifically for odd numbers.
        } else {
            evenCounter++; // Otherwise, the number is even, so increment the even numbers' counter.
        }
    }

    // After analyzing all numbers, make a final decision based on the parity of the even numbers' total count.
    if (evenCounter % 2 !== 0) { // If the cumulative count of even numbers is itself odd.
        console.log("YES"); // Output the affirmative string.
    } else {
        console.log("NO"); // Otherwise, output the negative string.
    }
}

// Initiate the data analysis process by fetching content from standard input.
// This uses Node.js's file system module to synchronously read the input.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));