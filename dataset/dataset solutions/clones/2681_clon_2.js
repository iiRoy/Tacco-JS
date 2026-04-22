// This function orchestrates the primary data processing flow.
function processInputData(rawDataString) {
    // Split the entire input string into individual lines.
    const linesOfText = rawDataString.split('\n');

    // Extract the total number of elements from the first line.
    const totalElements = linesOfText[0];

    // Extract the space-separated values from the second line.
    const heightStrings = linesOfText[1].split(' ');

    // Initialize a status indicator, assuming a positive outcome initially.
    var isConditionMet = 'Yes';

    // A temporary boolean variable, currently unused in the logic.
    var isProcessingComplete = false;

    // Declare an array to hold the parsed numeric values.
    var numericValues = [];

    // Populate the numeric array by converting string values to integers.
    for (var idxCounter = 0; idxCounter < totalElements; idxCounter++) {
        numericValues.push(parseInt(heightStrings[idxCounter], 10)); // Base 10 parsing
    }

    // Adjust the first element if it is greater than zero.
    if (numericValues[0] > 0) {
        numericValues[0] = numericValues[0] - 1;
    }


    // Iterate through the array starting from the second element to apply the core logic.
    for (var loopIndex = 1; loopIndex < totalElements; loopIndex++) {

        // Scenario 1: Current element is greater than the previous one.
        if (numericValues[loopIndex - 1] < numericValues[loopIndex]) {
            isConditionMet = 'Yes'; // Condition remains met.
            numericValues[loopIndex] = numericValues[loopIndex] - 1; // Decrement current element.
        }
        // Scenario 2: Current element is equal to the previous one.
        else if (numericValues[loopIndex - 1] === numericValues[loopIndex]) {
            isConditionMet = 'Yes'; // Condition remains met.
        }
        // Scenario 3: Current element is less than the previous one.
        else {
            // Sub-scenario A: The difference is exactly one.
            if (numericValues[loopIndex - 1] - numericValues[loopIndex] === 1) {
                isConditionMet = 'Yes'; // Condition remains met.
            }
            // Sub-scenario B: The difference is greater than one.
            else {
                isConditionMet = 'No'; // Condition is not met.
            }
        }

        // If the condition is found to be 'No', terminate the loop early.
        if (isConditionMet === 'No')
            break;
    }

    // This section iterates through the modified numeric array and logs each element.
    // It's part of the original structure, even if its purpose isn't immediately obvious for the "Yes/No" problem.
    numericValues.map((currentValue) => {
        console.log(currentValue);
    });

    // Output the final determination of the condition.
    console.log(isConditionMet);
}

// Invoke the primary function, reading input from standard input stream.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));