// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // Divide the entire raw input string into individual lines.
    const inputLines = rawData.split("\n");

    // The initial line is expected to contain two numeric bounds, separated by a space.
    const parts = inputLines[0].split(" ");
    let lowerBoundStr = parts[0]; // Stores the textual representation of the starting value.
    let upperBoundStr = parts[1]; // Stores the textual representation of the ending value.

    let resultCount = 0; // A counter to track the number of doubling operations performed.

    // Determine if the numerical bounds can be safely handled by standard JavaScript number types.
    // The threshold of 14 digits is chosen to prevent potential floating-point inaccuracies with large integers.
    if (lowerBoundStr.length <= 14 && upperBoundStr.length <= 14) {
        // Convert the string representations of the bounds into actual numbers.
        let currentLowerNum = Number(lowerBoundStr);
        const targetUpperNum = Number(upperBoundStr);

        // Continuously double the current lower number until it exceeds the upper target.
        while (currentLowerNum <= targetUpperNum) {
            currentLowerNum = currentLowerNum * 2; // Perform the doubling operation.
            resultCount++; // Increment the operation counter for each doubling.
        }
    } else {
        // For numbers exceeding the safe integer limit, process them as strings to maintain precision.
        // Pad both bounds with leading zeros to ensure a consistent length for subsequent string slicing.
        lowerBoundStr = "0000000000" + lowerBoundStr;
        upperBoundStr = "0000000000" + upperBoundStr;

        // Decompose the large number strings into two components: a 'prefix' (most significant digits)
        // and a 'suffix' (the last 10 least significant digits).
        const currentPrefix = lowerBoundStr.slice(0, -10);   // The leading part of the current lower bound.
        const currentSuffix = lowerBoundStr.slice(-10);     // The trailing 10 digits of the current lower bound.
        const targetPrefix = upperBoundStr.slice(0, -10);   // The leading part of the upper target bound.
        const targetSuffix = upperBoundStr.slice(-10);     // The trailing 10 digits of the upper target bound.

        // Represent the large numbers as arrays, where the first element is the prefix (as a number)
        // and the second element is the suffix (as a number).
        let currentLowerArr = [Number(currentPrefix), Number(currentSuffix)];
        const targetUpperArr = [Number(targetPrefix), Number(targetSuffix)];

        // A utility function to compare two large numbers, each represented as a [prefix, suffix] array.
        const isLessThanOrEqual = function(firstNumParts, secondNumParts) {
            // First, compare the most significant parts (prefixes).
            if (firstNumParts[0] < secondNumParts[0]) {
                return true; // If the first prefix is smaller, the first number is smaller.
            }
            // If prefixes are identical, then compare the less significant parts (suffixes).
            else if (firstNumParts[0] === secondNumParts[0] && firstNumParts[1] <= secondNumParts[1]) {
                return true; // If prefixes are equal and the first suffix is less than or equal, the first number is less than or equal.
            }
            // In all other cases, the first number is greater than the second.
            else {
                return false;
            }
        };

        // Continue doubling the current lower number (represented as an array) until it surpasses the upper target.
        while (isLessThanOrEqual(currentLowerArr, targetUpperArr)) {
            // Double the suffix part and convert it to a string to check its length.
            const doubledSuffixStr = (currentLowerArr[1] * 2).toString();

            // If the doubled suffix has 11 digits, it indicates a carry-over to the prefix.
            if (doubledSuffixStr.length === 11) {
                // Update the current lower number: double the prefix and add the carry-over (1),
                // and take the last 10 digits of the doubled suffix as the new suffix.
                currentLowerArr = [currentLowerArr[0] * 2 + 1, Number(doubledSuffixStr.slice(-10))];
            } else {
                // If no carry-over, simply double both the prefix and the suffix.
                currentLowerArr = [currentLowerArr[0] * 2, Number(doubledSuffixStr)];
            }
            resultCount++; // Increment the operation counter.
        }
    }

    // Display the final calculated count of operations.
    console.log(resultCount);
}

// The following line handles reading input from standard input and invoking the main processing function.
// It should not be altered as per the problem statement.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
