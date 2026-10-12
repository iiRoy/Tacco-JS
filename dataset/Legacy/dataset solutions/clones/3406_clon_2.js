// This function is designed to process a given string of numerical data.
function processNumericalData(incomingText) {
    // The initial step involves parsing the input string.
    // It's split by newline characters, and each resulting substring is converted into an integer.
    var numericalArray = incomingText.split('\n').map((strValue) => parseInt(strValue, 10));

    // The first element of the array is typically a count, which is stored but not directly used in the subsequent calculation.
    var elementCount = numericalArray[0];
    // This count element is then removed from the array to prepare for further operations.
    numericalArray.shift();

    // Next, the largest value among the remaining numbers in the array is identified.
    var highestNumber = Math.max.apply(null, numericalArray);

    // The position (index) of this highest number within the array is determined.
    var highestNumberIndex = numericalArray.indexOf(highestNumber);

    // The value at the identified index (the highest number) is then divided by two.
    numericalArray[highestNumberIndex] = (numericalArray[highestNumberIndex] / 2);

    // Finally, all the numbers in the modified array are summed up.
    var finalAccumulatedValue = numericalArray.reduce((currentTotal, itemValue) => currentTotal += itemValue, 0);

    // The computed sum is then printed to the standard output.
    console.log(finalAccumulatedValue);
}

// The program starts by reading data from standard input.
// The 'fs' module is used to synchronously read the file located at '/dev/stdin',
// interpreting its content as UTF-8 encoded text.
// This read content is then passed to the main processing function.
processNumericalData(require('fs').readFileSync('/dev/stdin', 'utf8'));
