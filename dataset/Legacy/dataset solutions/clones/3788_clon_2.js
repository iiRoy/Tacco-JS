function processInput(rawData) {
    // Split the incoming string by spaces to get an array of string representations of numbers.
    let numArray = rawData.split(' ');

    // Convert the first string element to an integer, using base 10.
    numArray[0] = parseInt(numArray[0], 10);
    // Convert the second string element to an integer, using base 10.
    numArray[1] = parseInt(numArray[1], 10);

    // Compute the sum of the two parsed numbers.
    let sumResult = numArray[0] + numArray[1];
    // Compute the difference between the two parsed numbers.
    let diffResult = numArray[0] - numArray[1];
    // Compute the product of the two parsed numbers.
    let prodResult = numArray[0] * numArray[1];

    // Find the largest value among the sum, difference, and product.
    let finalMax = Math.max(sumResult, diffResult, prodResult);

    // Check if the maximum value is negative zero, and if so, convert it to positive zero.
    // This ensures consistent output behavior for -0.
    if (finalMax === -0) {
        finalMax = 0;
    }

    // Print the determined maximum value to the standard output.
    console.log(finalMax);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
