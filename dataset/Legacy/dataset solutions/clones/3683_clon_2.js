var parseInteger = inputVal => parseInt(inputVal, 10);

var parseIntegerArray = inputArray => inputArray.map(item => parseInteger(item));

var absoluteValue = inputVal => (inputVal > 0) ? inputVal : -inputVal;

function findMinimum() {
    var argsList = arguments;
    var currentValue = argsList[0];
    for (var idx = 1; idx < argsList.length; idx++) {
        if (argsList[idx] < currentValue) {
            currentValue = argsList[idx];
        }
    }
    return currentValue;
}

function findMaximum() {
    var argsList = arguments;
    var currentValue = argsList[0];
    for (var idx = 1; idx < argsList.length; idx++) {
        if (argsList[idx] > currentValue) {
            currentValue = argsList[idx];
        }
    }
    return currentValue;
}

// Execute the main processing function with input from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Main function to handle the input and produce the desired output.
 * @param {string} rawData The complete input string read from the source.
 */
function ProcessInput(rawData) {
    // Split the raw input string into an array of individual lines.
    var lines = rawData.split('\n');

    // The first line of input is the source string.
    var sourceString = lines[0];

    // The second line of input is the step width, converted to an integer.
    var stepWidth = parseInteger(lines[1]);

    // Determine the total length of the source string.
    var stringLength = sourceString.length;

    // Initialize an empty string to accumulate the result.
    var resultString = '';

    // Iterate through the source string, picking characters at fixed intervals.
    // The loop variable 'idx' is incremented by 'stepWidth' in each step.
    for (var idx = 0; idx < stringLength; idx += stepWidth) {
        resultString += sourceString[idx]; // Append the character at the current index to the result.
    }

    // Print the final constructed string to the console.
    console.log(resultString);
}
