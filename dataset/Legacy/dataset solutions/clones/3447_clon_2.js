function processInput(inputString) {
    // This function processes a given string input.
    inputString = inputString.split("\n")[0]; // Extract the first line of the input.
    inputString = inputString.split(" "); // Split the line by spaces into an array.

    console.log(Number(inputString[0]) + Number(inputString[1]) / 2); // Perform calculation and print result.
    // The line below was a previous debug statement, now commented out.
    // console.log(Number(inputString[1]) / 2);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
