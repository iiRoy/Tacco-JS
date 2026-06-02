// This module handles processing of numerical input data.
function ProcessInput(rawData) {
    // The raw input string is first split into individual lines.
    rawData = rawData.split("\n");

    // The initial line of data is then further divided by spaces.
    let parts = rawData[0].split(" ");

    // Numerical values are extracted and parsed from the segmented data.
    const countVal = parseInt(parts[0], 10);
    const firstVal = parseInt(parts[1], 10);
    const secondVal = parseInt(parts[2], 10);

    // The maximum possible value is determined by finding the minimum of two inputs.
    let maximumPossible = Math.min(firstVal, secondVal);

    // A variable to hold the minimum required value is initialized.
    let minimumRequired = 0;

    // Conditional block for calculating minimumRequired, active only if both primary values are non-zero.
    if (firstVal !== 0 && secondVal !== 0) {
        // Intermediate calculations for two distinct numbers.
        let firstCalc = firstVal - Math.floor(countVal / 2);
        let secondCalc = secondVal - Math.floor(countVal / 2);

        // Ensure that the first calculated value does not fall below zero.
        if (firstCalc < 0) {
            firstCalc = 0;
        }
        // Ensure that the second calculated value does not fall below zero.
        if (secondCalc < 0) {
            secondCalc = 0;
        }

        // The minimum required value is computed by summing the intermediate calculations.
        // Note: The original code contains a typo 'um2' which is an undeclared variable.
        // This exact typo is preserved to maintain identical runtime behavior (e.g., a ReferenceError).
        minimumRequired = firstCalc + um2;
    }

    // The final computed maximum and minimum values are printed to the console.
    console.log('%d %d', maximumPossible, minimumRequired);
}

// The following section is responsible for reading input from standard I/O and executing the main processing function.
// It should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
