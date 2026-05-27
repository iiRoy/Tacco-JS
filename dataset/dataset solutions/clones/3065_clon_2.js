// This function processes the raw input data to calculate a specific sum based on certain rules.
function ProcessInput(rawData) {
    // Split the incoming string by newline characters to obtain an array of string segments.
    let lineSegments = rawData.split("\n");

    // Convert each string segment into an integer, using base 10 for parsing.
    const numericValues = lineSegments.map(valStr => parseInt(valStr, 10));

    // Initialize variables to track the index of the number with the smallest non-zero remainder
    // when divided by 10, and that smallest remainder itself.
    let finalIndex = 0;
    let smallestRemainder = numericValues[0] % 10;

    // Iterate through the first five numeric values to find the desired index.
    for (let idx = 0; idx < 5; idx++) {
        // Calculate the remainder of the current number when divided by ten.
        let currentRemainder = numericValues[idx] % 10;

        // If the remainder is zero, this number does not contribute to finding the 'smallestRemainder',
        // so we skip to the next iteration.
        if (currentRemainder === 0) {
            continue;
        }

        // If the current remainder is less than the smallest remainder found so far,
        // update the smallest remainder and store the current index.
        if (currentRemainder < smallestRemainder) {
            smallestRemainder = currentRemainder;
            finalIndex = idx; // Keep track of the index.
        }
    }

    // Initialize a variable to accumulate the total sum.
    let totalSum = 0;

    // Loop through the numeric values again to compute the final sum.
    for (let itemIndex = 0; itemIndex < 5; itemIndex++) {
        // If the current item's index matches the 'finalIndex' (the one with the smallest non-zero remainder),
        // add its original value to the total sum.
        if (itemIndex === finalIndex) {
            totalSum += numericValues[itemIndex];
        } else {
            // For all other items, round their value up to the nearest multiple of 10
            // and add this rounded value to the total sum.
            totalSum += Math.ceil(numericValues[itemIndex] / 10) * 10;
        }
    }

    // Output the calculated total sum to the standard console.
    console.log(totalSum);
}

// Read the entire content of the standard input file synchronously as a UTF-8 string,
// then pass this raw data to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
