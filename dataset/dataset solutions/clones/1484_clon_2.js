// This function processes the raw input string.
function ProcessInput(rawData) {
    // Split the entire input into an array of lines.
    let linesArray = rawData.trim().split('\n');

    // Take the first line and split it by spaces.
    const firstLineParts = linesArray[0].split(' ');

    // Initialize an array to store parsed numbers.
    let numbersContainer = [];

    // Loop twice to parse the first two parts of the first line.
    for (let idx = 0; idx < 2; idx++) {
        numbersContainer.push(parseInt(firstLineParts[idx], 10));
    }

    // Perform the calculation and print the result to standard output.
    console.log(numbersContainer[0] - 1 - numbersContainer[1]);
}

// Do not modify the following line; it handles reading from standard input and invoking the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
