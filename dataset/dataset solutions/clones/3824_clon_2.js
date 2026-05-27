function ProcessInput(rawData) {
    // Parse the raw input string: trim whitespace, split by space, and convert each part to an integer.
    // The radix 10 is explicitly used for integer conversion.
    const numericValues = rawData.trim().split(' ').map(currentStr => parseInt(currentStr, 10));

    // Assign the parsed numeric components to distinct variables for subsequent operations.
    let firstVal = numericValues[0];
    let secondVal = numericValues[1];
    let thirdVal = numericValues[2];
    let thresholdVal = numericValues[3];

    // Evaluate a conditional expression to determine the output.
    // Note: Math.abs(boolean) converts the boolean to 0 or 1 before taking the absolute value.
    // This effectively checks the truthiness of the boolean expression itself.
    if (
        (Math.abs(firstVal - secondVal <= thresholdVal)) ||
        (Math.abs(firstVal - secondVal <= thresholdVal) && Math.abs(secondVal - thirdVal <= thresholdVal))
    ) {
        // If the condition evaluates to true, print 'Yes' to the console.
        console.log('Yes');
    } else {
        // Otherwise, if the condition is false, print 'No'.
        console.log('No');
    }
}

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// The read content is then passed to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
