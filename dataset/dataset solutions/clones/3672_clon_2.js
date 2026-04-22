// This function is designed to handle and process a multi-line string input.
function     processInput (    rawData    ) {
    // The raw input string is split into an array of individual lines.
    var    lineSegments    = rawData.split('\n');
    // The first line of the input specifies the total number of test cases.
    var    testCount    = parseInt(lineSegments[0]   ,   10);

    // A loop iterates through each test case, starting from the second line of input.
    for (
        var currentCase = 1;
        currentCase <= testCount;
        currentCase++
    ) {
        // A boolean-like flag, initialized to 0, indicates if the outcome for the current case has been determined.
        var    outcomeDetermined = 0;

        // The current line is further split into an array of strings based on space delimiters.
        var    valueStrings    = lineSegments[currentCase].split(' ');

        // Four primary integer values are parsed from the split strings for the current test.
        var    processValue     = parseInt(valueStrings[0]);
        var    thresholdValue   = parseInt(valueStrings[1]);
        var    upperBound       = parseInt(valueStrings[2]);
        var    adjustmentValue  = parseInt(valueStrings[3]);

        // The initial state of 'processValue' is stored for later comparison purposes.
        var    originalProcessValue = processValue;
        // A temporary calculation is performed using the modulo operator.
        var    tempProcessValue     = processValue % thresholdValue;

        // Series of conditional checks to determine an early "No" or "Yes" outcome.
        if (processValue < thresholdValue) {
            console.log("No");
            continue; // Move to the next test case
        }

        if (adjustmentValue < thresholdValue) {
            console.log("No");
            continue; // Move to the next test case
        }

        if (processValue < upperBound) {
            console.log("Yes");
            continue; // Move to the next test case
        }

        // The 'processValue' is re-assigned based on the temporary value and the threshold.
        processValue = tempProcessValue + thresholdValue;

        // The main iterative processing loop begins.
        while (processValue >= thresholdValue) {
            // Conditional logic applies different transformations to 'processValue'.
            if ((processValue - thresholdValue) <= upperBound) {
                tempProcessValue = processValue - thresholdValue + adjustmentValue;
                processValue     = tempProcessValue;
            }
            else {
                tempProcessValue = processValue - thresholdValue;
                processValue     = tempProcessValue;
            }

            // A check within the loop to see if a specific state has been reached.
            if (processValue >= (2 * originalProcessValue) || processValue === originalProcessValue) {
                console.log("Yes");
                outcomeDetermined = 1; // Set flag to indicate outcome found
                break; // Exit the while loop
            }
        }
        // If the 'outcomeDetermined' flag is still 0 after the loop, it means no "Yes" was found.
        if (outcomeDetermined === 0) {
            console.log("No");
        }
    }
}

// The program initiates by reading data from standard input using Node.js 'fs' module.
processInput(
    require('fs').readFileSync(
        '/dev/stdin',
        'utf8'
    )
);