function processInputData(inputValues) {
    // Split the incoming string by spaces to separate individual number strings.
    inputValues = inputValues.split(" ");

    // Iterate through the first three elements and convert them to integers.
    for (let currentIdx = 0; currentIdx < 3; currentIdx++) {
        inputValues[currentIdx] = parseInt(inputValues[currentIdx], 10);
    }

    // Determine the largest value among the three parsed numbers.
    let maxValue = Math.max(inputValues[0], inputValues[1], inputValues[2]);

    // Calculate the sum of all three numbers.
    let totalValue = inputValues[0] + inputValues[1] + inputValues[2];

    // Check if twice the maximum value is equal to the total sum.
    // This condition holds true if the two smaller numbers sum up to the largest number.
    console.log((maxValue * 2 === totalValue) ? "Yes" : "No");
}

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it to our data processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
