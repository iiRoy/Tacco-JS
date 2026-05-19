function processInput(rawData) {
    // This function takes raw string input, processes it, and prints a calculated sum.

    // Step 1: Parse the raw input string into an array of integers.
    // Each line in the input string is converted to a base-10 integer.
    let numericData = rawData
        .split('\n') // Split the input string by newline characters.
        .map((numStr) => parseInt(numStr, 10)); // Convert each string part to an integer.

    // Step 2: Store the first element, which might represent a count, though it's not used further.
    const initialCount = numericData[0];

    // Step 3: Remove the first element from the array.
    // This modifies the 'numericData' array in place.
    numericData.shift();

    // Step 4: Find the maximum value among the remaining numbers in the array.
    // Math.max.apply is used to find the maximum value from an array of numbers.
    const greatestValue = Math.max.apply(null, numericData);

    // Step 5: Determine the index of the first occurrence of the greatest value.
    const indexOfGreatest = numericData.indexOf(greatestValue);

    // Step 6: Modify the array by halving the value at the found index.
    // This is a crucial step in the transformation logic.
    numericData[indexOfGreatest] = (numericData[indexOfGreatest] / 2);

    // Step 7: Calculate the sum of all elements in the modified array.
    // The reduce method iterates through the array, accumulating the total.
    let totalSum = numericData.reduce((accumulator, currentVal) => accumulator += currentVal, 0);

    // Step 8: Output the final calculated sum to the console.
    console.log(totalSum);
}

// The program execution begins here.
// It reads the entire content of standard input as a UTF-8 string.
// This content is then passed to the 'processInput' function for processing.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
