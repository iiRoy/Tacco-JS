function processInput(inputString) {
    // Convert the provided input string into an integer value.
    let parsedValue = parseInt(inputString);

    // Perform the calculation: ceiling of (value divided by 2) minus 1.
    // Then, print the result to the console.
    console.log(Math.ceil(parsedValue / 2) - 1);
}

// Read the content from standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
