function calculateTwoFactorCount(numericValue) {
    let factorAccumulator = 0;
    // Iteratively divide by two using bitwise right shift until the number becomes odd.
    // This replaces the modulo operator (%) and arithmetic division (/).
    // The check `numericValue !== 0` prevents an infinite loop if 0 were an input,
    // though typical problem constraints imply positive integers.
    while ((numericValue & 1) === 0 && numericValue !== 0) {
        numericValue >>= 1; // Equivalent to numericValue = numericValue / 2
        factorAccumulator++;
    }
    return factorAccumulator;
}

function processInputData(sourceContent) {
    // Split the raw input string into an array of lines.
    const contentLines = sourceContent.split("\n");

    // Extract the second line, split it by spaces, and convert each part to a number.
    // Using `map(Number)` is a concise functional approach.
    const numericalSequence = contentLines[1].split(' ').map(Number);

    // Use the `reduce` method to sum the results of `calculateTwoFactorCount` for each number.
    // This replaces the imperative `for...of` loop and manual accumulator variable.
    const totalDivisionsByTwo = numericalSequence.reduce((currentSum, elementValue) => {
        // For each number in the sequence, calculate its two-factor count
        // and add it to the running total.
        return currentSum + calculateTwoFactorCount(elementValue);
    }, 0); // Initialize the sum to zero.

    // Output the final computed total to the console.
    console.log(totalDivisionsByTwo);
}

// Read the input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
