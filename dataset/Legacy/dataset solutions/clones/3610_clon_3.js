// parameter "rawInputString" gets all data
function processData(rawInputString) {
    // Split the raw input into individual lines
    const dataLines = rawInputString.split("\n");

    // Extract the first line as a string and the second line as an integer
    const firstLineStr = dataLines[0];
    const thresholdVal = parseInt(dataLines[1], 10);

    // Initialize cumulative sum for power calculations
    let cumulativePowerSum = 0;

    // Define a constant for 10^15 to be used in the exponent calculation
    const BASE_TEN_POWER_FIFTEEN = Math.pow(10, 15);
    // Calculate the fixed exponent value (5 * 10^15)
    const fixedExponent = 5 * BASE_TEN_POWER_FIFTEEN;

    // Store the length of the first string to optimize loop condition
    const stringLength = firstLineStr.length;

    // Iterate through each character of the first string
    for (let idx = 0; idx < stringLength; idx++) {
        // Convert the current character to an integer explicitly
        const charDigit = parseInt(firstLineStr[idx], 10);

        // Calculate the power of the current character using the fixed exponent
        const currentTermPower = Math.pow(charDigit, fixedExponent);

        // Add the calculated power to the running total
        cumulativePowerSum += currentTermPower;

        // Check if the cumulative sum has met or exceeded the threshold value
        if (cumulativePowerSum >= thresholdVal) {
            // If the condition is met, print the current character (as a number)
            console.log('%d', charDigit);
            // Exit the loop as the required condition has been satisfied
            break;
        }
    }
}

// Don't edit this line!
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
