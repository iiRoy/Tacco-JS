function ProcessInput(rawData) {
    // Initialize the outcome string to a default negative value.
    let resultString = 'No';

    // Clean up the raw input: remove leading/trailing whitespace and split into lines.
    rawData = rawData.trim().split("\n");

    // Parse the first line of input.
    // It's expected to contain space-separated numbers.
    // Convert each part to an integer and store in an array.
    let numArray = rawData[0].split(' ').map((val) => (parseInt(val, 10)));

    // Sort the array of numbers in ascending order.
    numArray.sort((a, b) => a - b);

    // Check for the first condition: if the first two elements are identical
    // and different from the third element.
    if (numArray[0] === numArray[1]) {
        if (numArray[0] !== numArray[2]) {
            resultString = 'Yes'; // Update the result if condition met.
        }
    }

    // Check for the second condition: if the last two elements are identical
    // and different from the first element.
    // This is an independent check, so it uses 'if' not 'else if'.
    if (numArray[1] === numArray[2]) {
        if (numArray[0] !== numArray[2]) {
            resultString = 'Yes'; // Update the result if condition met.
        }
    }

    // Output the final determined result to the console.
    console.log(resultString);
}

// The following lines handle reading from standard input and invoking the main processing function.
// They should not be modified as they are part of the execution environment setup.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
