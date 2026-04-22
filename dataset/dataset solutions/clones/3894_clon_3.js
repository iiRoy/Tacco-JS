// This module is responsible for processing raw text input from a standard source
// to perform a specific numerical analysis based on predefined criteria.
function ProcessInputData(rawTextInput) {
    // Define a constant for the newline character, enhancing code readability.
    const NEWLINE_SEPARATOR = "\n";
    // Define a constant for the space character, used to delimit numerical values on a line.
    const SPACE_DELIMITER = " ";

    // Step 1: Divide the entire input string into an array of individual lines.
    let inputLinesArray = rawTextInput.split(NEWLINE_SEPARATOR);

    // Initial validation to ensure the input contains at least the minimum required lines.
    // The problem expects at least two lines of data.
    if (inputLinesArray.length < 2) {
        console.error("Error: Input data is incomplete. Expected at least two lines of information.");
        return; // Terminate execution if input is insufficient.
    }

    // Step 2: Parse the first line, which contains configuration settings.
    // This line is split by spaces to isolate individual parameter strings.
    let configurationParameters = inputLinesArray[0].split(SPACE_DELIMITER);

    // Validate the number of parameters on the configuration line.
    // The logic requires at least three parameters, even if some are unused.
    if (configurationParameters.length < 3) {
        console.error("Error: Configuration line is malformed. Expected at least three numerical parameters.");
        return;
    }

    // Extract the critical threshold value from the configuration parameters.
    // The original problem statement indicates that only the third value (index 2) is relevant
    // for the core logic, while the first two (indices 0 and 1) are present but unused.
    let comparisonThreshold = Number(configurationParameters[2]);

    // Validate that the extracted threshold is indeed a valid number.
    if (isNaN(comparisonThreshold)) {
        console.error("Error: The specified threshold value is not a valid number.");
        return;
    }

    // Step 3: Process the second line, which holds a series of numerical charges.
    // First, split this line into an array of string representations of the charges.
    let rawChargeStrings = inputLinesArray[1].split(SPACE_DELIMITER);

    // Convert all string charges into actual numeric values.
    // A filter is applied to remove any entries that fail to convert to a valid number (NaN),
    // ensuring robust processing of potentially imperfect input.
    let numericChargeValues = rawChargeStrings
                                .map(stringVal => Number(stringVal))
                                .filter(numVal => !isNaN(numVal));

    // Step 4: Initialize counters for two distinct categories of charges.
    // `countAboveThreshold`: Stores the number of charges strictly greater than `comparisonThreshold`.
    let countAboveThreshold = 0;
    // `countBelowOrEqualThreshold`: Stores the number of charges less than or equal to `comparisonThreshold`.
    let countBelowOrEqualThreshold = 0;

    // Step 5: Iterate through each numeric charge value to categorize it.
    // A `for...of` loop is used for clear and modern iteration over array elements.
    for (const individualCharge of numericChargeValues) {
        // Evaluate if the current charge exceeds the defined threshold.
        const isCurrentlyAboveThreshold = individualCharge > comparisonThreshold;

        // Increment the appropriate counter based on the evaluation.
        if (isCurrentlyAboveThreshold) {
            countAboveThreshold++;
        } else {
            countBelowOrEqualThreshold++;
        }
    }

    // Step 6: Determine the minimum count between the two categories.
    // This minimum value is the final result required by the problem's logic.
    const calculatedMinimumCount = Math.min(countAboveThreshold, countBelowOrEqualThreshold);

    // Step 7: Output the final calculated minimum count to standard output.
    console.log(calculatedMinimumCount);
}

// Standard boilerplate code for competitive programming environments.
// This part reads the entire standard input synchronously and invokes the main processing function.
// It should generally not be altered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));