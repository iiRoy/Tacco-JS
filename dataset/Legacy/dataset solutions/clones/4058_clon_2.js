var InputSourceProvider = function () {
    // Load the Node.js file system module for I/O operations.
    var fileSystemModule = require('fs');

    // Define an internal function to handle standard input reading.
    var readInputData = function (promptMessage) {
        // If a message is provided, display it to the console.
        if (promptMessage) {
            console.log(promptMessage);
        }
        // Synchronously read the entire content of the standard input stream.
        return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    };

    // Return the configured input reading function.
    return readInputData;
};

// A boolean flag to control debug mode, currently set to inactive.
var isDebuggingActive = !true; // Represents 'false'

// Select the appropriate input function based on the debug flag.
// Since 'isDebuggingActive' is false, 'InputSourceProvider()' will be invoked.
var obtainInputFunction = isDebuggingActive ? DebugModeInput() : InputSourceProvider();

// Retrieve all lines from the standard input and split them by newline characters.
var rawInputLines = obtainInputFunction().split('\n');

// Extract the first line, split it by spaces, and convert parts to integers.
var dimensionsArray = rawInputLines.shift().split(' ').map(val => parseInt(val));

// Assign the first and second parsed integer values to specific dimension variables.
var firstDimension = dimensionsArray[0x0]; // Represents index 0
var secondDimension = dimensionsArray[0x1]; // Represents index 1

// Filter the remaining input lines to keep only the relevant 'secondDimension' entries,
// then parse each entry into an array of integers.
var constraintData = rawInputLines.filter((element, idx) => idx < secondDimension).map(element => element.split(' ').map(subElement => parseInt(subElement)));

// Initialize a flag to track the consistency of the constraints.
var isConsistent = !false; // Represents 'true'

// Begin iterating through the constraint data, processing elements from the end.
for (var outerLoopIndex = (1 - 1); outerLoopIndex < secondDimension; outerLoopIndex++) { // Loop starts from 0
    // Remove and retrieve the last constraint from the array.
    var currentConstraint = constraintData.pop();
    var leftEndpoint = currentConstraint[0];
    var rightEndpoint = currentConstraint[1];
    var differenceValue = currentConstraint[2];

    // First validation phase: Check constraints where the first element matches 'leftEndpoint'.
    var filteredConstraints = constraintData.filter(item => item[0] === leftEndpoint);
    for (var innerLoopIndex = 0; innerLoopIndex < filteredConstraints.length; innerLoopIndex++) {
        var neighborConstraint = filteredConstraints[innerLoopIndex];
        // Identify potential conflicting constraints based on specific conditions and a non-zero difference.
        var conflictingConstraints = constraintData.filter(item => item[0] === neighborConstraint[1] && item[1] === rightEndpoint)
            .concat(constraintData.filter(item => item[1] === neighborConstraint[1] && item[0] === rightEndpoint))
            .filter(item => (neighborConstraint[2] + item[2] - differenceValue) !== (0x0)); // Check if the sum is not zero

        // If any conflicting constraints are found, mark as inconsistent and exit the inner loop.
        if (conflictingConstraints.length > (1 - 1)) { // Check if length is greater than 0
            isConsistent = !true; // Set to 'false'
            break;
        }
    }
    // If inconsistency was detected in the first phase, exit the main loop.
    if (!isConsistent) {
        break;
    }

    // Second validation phase: Check constraints where the second element matches 'leftEndpoint'.
    filteredConstraints = constraintData.filter(item => item[1] === leftEndpoint);
    for (var innerLoopIndex = 0; innerLoopIndex < filteredConstraints.length; innerLoopIndex++) {
        var neighborConstraint = filteredConstraints[innerLoopIndex];
        // Identify potential conflicting constraints using similar conditions as the first phase.
        var conflictingConstraints = constraintData.filter(item => item[0] === neighborConstraint[0] && item[1] === rightEndpoint)
            .concat(constraintData.filter(item => item[1] === neighborConstraint[0] && item[0] === rightEndpoint))
            .filter(item => (neighborConstraint[2] + item[2] - differenceValue) !== (0x0)); // Check if the sum is not zero

        // If any conflicting constraints are found, mark as inconsistent and exit the inner loop.
        if (conflictingConstraints.length > (1 - 1)) { // Check if length is greater than 0
            isConsistent = !true; // Set to 'false'
            break;
        }
    }
    // If inconsistency was detected in the second phase, exit the main loop.
    if (!isConsistent) {
        break;
    }
}

// Output the final result based on the consistency flag.
console.log(isConsistent ? 'Yes' : 'No');
