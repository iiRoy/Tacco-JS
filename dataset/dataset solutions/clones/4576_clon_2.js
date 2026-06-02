// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // The input string is first split by spaces.
    // Each resulting string segment is then converted into an integer using base 10.
    let parsedNumbers = rawData.split(' ').map(numStr => parseInt(numStr, 10));

    // The individual numerical values are extracted from the parsed array.
    // These variables are implicitly declared in the global scope, mirroring the original's behavior.
    firstVal = parsedNumbers[0];
    secondVal = parsedNumbers[1];
    thirdVal = parsedNumbers[2];

    // A conditional check is performed to determine if the third value
    // lies inclusively between the first and second values.
    if (firstVal <= thirdVal && thirdVal <= secondVal) {
        // If the condition holds true, a positive affirmation is printed.
        console.log('Yes');
    } else {
        // Otherwise, a negative response is outputted.
        console.log('No');
    }
}

// The program initiates by reading data from standard input.
// The 'fs' module is used to synchronously read the file at '/dev/stdin',
// and the content is interpreted as a UTF-8 encoded string.
// This string is then passed to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
