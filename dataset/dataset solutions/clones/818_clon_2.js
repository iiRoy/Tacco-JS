// This JavaScript code initiates standard input processing in a Node.js environment.
process.stdin.resume();

// The input stream is configured to interpret incoming data as UTF-8 encoded text.
process.stdin.setEncoding('utf8');

// Declare all necessary variables for the program's execution within a single 'var' statement,
// maintaining the exact number of declarations as the original.
// '_placeholderCount' is an unused variable mirroring the original's 'n'.
// 'createPowerOfTen' is a helper function to compute powers of 10.
// 'totalIterations' stores the main loop's cycle count.
// 'inputSegments' will contain the lines parsed from the input.
// 'segmentIndex' serves as the primary counter for the outer loop.
// 'tempResultArray' is an unused array, mirroring the original's 'r'.
// 'numericStrings' holds string parts of an input line.
// 'firstValue' and 'secondValue' are the numeric variables used in the nested loops.
// 'firstLimit' and 'secondLimit' define the upper bounds for these loops.
// 'foundInstances' counts the occurrences of a specific condition being met.
var _placeholderCount = -1,
    createPowerOfTen = function(powerInput) {
        // This function calculates 10 raised to the power of the integer part of 'powerInput'.
        // Math.floor is used for explicit integer conversion, functionally equivalent to '~~'.
        return Math.pow(10, Math.floor(powerInput));
    },
    totalIterations, inputSegments, segmentIndex, tempResultArray, numericStrings, firstValue, secondValue, firstLimit, secondLimit, foundInstances;

// Attach an event handler to the standard input stream that triggers when data becomes available.
process.stdin.on('data', function(incomingData) {
    // Split the entire block of incoming data into an array of individual lines.
    inputSegments = incomingData.split('\n');

    // The very first line of input specifies the total number of processing iterations required.
    totalIterations = Math.floor(inputSegments[0]);

    // Commence the main loop, iterating through each specified segment of data.
    for (segmentIndex = 0; segmentIndex < totalIterations; ++segmentIndex) {
        // Initialize an unused array, then split the current input line into its numeric components,
        // and reset the counter for matched conditions for this iteration.
        // This assignment structure mirrors the original's comma-separated assignments.
        tempResultArray = [], numericStrings = inputSegments[segmentIndex + 1].split(' '), foundInstances = 0;

        // Begin the outer nested loop. 'firstValue' starts from 10^(X-1) and goes up to 10^X - 1,
        // where X is derived from the first numeric string on the current input line.
        // The loop initialization uses a comma operator for multiple assignments, as in the original.
        for (firstValue = createPowerOfTen(numericStrings[0] - 1), firstLimit = createPowerOfTen(numericStrings[0]) - 1;
             firstValue < firstLimit;
             ++firstValue) {
            // Begin the inner nested loop. 'secondValue' starts from 10^(Y-1) and goes up to 10^Y - 1,
            // where Y is derived from the second numeric string on the current input line.
            // This loop initialization also uses a comma operator for identical structure.
            for (secondValue = createPowerOfTen(numericStrings[1] - 1), secondLimit = createPowerOfTen(numericStrings[1]) - 1;
                 secondValue < secondLimit;
                 ++secondValue) {
                // The core conditional logic:
                // It checks if the mathematical expression (secondValue^2 + secondValue - firstValue^2 + firstValue) / 2
                // is strictly equal to the string concatenation of 'firstValue' and 'secondValue'.
                // If this condition is true, the pair of values is logged to the console, and the match counter is incremented.
                // This entire operation is a single statement utilizing the logical AND (&&) and comma operators.
                ((secondValue * secondValue + secondValue - firstValue * firstValue + firstValue) / 2) == ('' + firstValue + secondValue)
                &&
                (console.log(firstValue + ' ' + secondValue), ++foundInstances)
                ;
            }
        }

        // After both nested loops complete for the current segment,
        // if no matching pairs were discovered (i.e., 'foundInstances' is zero/falsy),
        // a specific message indicating no matches is outputted.
        foundInstances || console.log('No cats.');
    }
});