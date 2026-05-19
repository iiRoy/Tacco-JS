const fileSystem = require('fs');

// Obtain raw input data from standard input, ensuring it's UTF-8 encoded and trimmed.
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();

// Divide the raw input into an array of individual lines.
let inputLines = rawData.split('\n');

// Declare a variable to hold the current line being processed in the loop.
let currentLine;

// Iterate through each line of the input array until no more lines remain.
while (currentLine = inputLines.shift()) {
    // Split the current line by spaces to separate the numerical components.
    const parts = currentLine.split(' ');

    // Convert the first part to a number, representing the numerator.
    const numerator = +parts[0];
    // Convert the second part to a number, representing the denominator.
    const denominator = +parts[1];
    // Convert the third part to a number, representing the desired precision.
    const precisionDigits = +parts[2];

    // Perform the division and format the result to (precisionDigits + 1) decimal places.
    // The extra digit is kept temporarily to ensure correct extraction of the first 'n' digits.
    let decimalString = (numerator / denominator).toFixed(precisionDigits + 1);

    // Locate the position of the decimal point within the formatted string.
    const dotIndex = decimalString.indexOf('.');

    // Extract the substring containing the digits immediately after the decimal point,
    // excluding the last digit which was added for rounding purposes.
    decimalString = decimalString.substring(dotIndex + 1, decimalString.length - 1);

    // Convert the extracted decimal digit string into an array of characters,
    // then sum the numeric value of each character using a reducer function.
    let sumOfDigits = decimalString.split('').reduce((accumulator, currentDigitChar) => {
        return (+accumulator) + (+currentDigitChar);
    });

    // Print the calculated sum of the decimal digits to the console.
    console.log(sumOfDigits);
}
