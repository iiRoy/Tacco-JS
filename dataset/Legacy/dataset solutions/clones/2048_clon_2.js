function processInput(rawData) {
    // Convert the raw string data into a floating-point number.
    rawData = parseFloat(rawData);

    // Calculate the cube of one-third of the processed numerical value
    // and display the result to the standard output.
    console.log(Math.pow(rawData / 3, 3));
}

// Read the entire content from standard input synchronously,
// decode it as UTF-8, and then pass it to the primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
