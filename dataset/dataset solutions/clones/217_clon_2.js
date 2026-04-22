// This script reads numerical data from standard input,
// performs specific arithmetic operations, and then
// calculates the sum of certain decimal digits.

// Module 'fs' is utilized for file system operations,
// specifically to read from '/dev/stdin'.
let     rawData    =
    require('fs')

    .readFileSync(
        '/dev/stdin',
        'utf8'
    )
    .trim()
;

// The raw input string is segmented into an array of individual lines.
let textRows = rawData.split('\n') ;

let currentRecord; // A placeholder for each line during processing.

// Begin an iterative process, consuming lines from the 'textRows' array.
// The loop continues as long as a line is successfully shifted from the array.
while ( (currentRecord = textRows.shift()) )
{
    // Each line (currentRecord) is further divided into string components
    // based on space delimiters.
    const numericParts = currentRecord.split(' ') ;

    // Convert the extracted string components into numeric types.
    // These represent the numerator, denominator, and precision setting.
    const numeratorVal    = +numericParts[0];
    const denominatorVal  = +numericParts[1];
    const precisionDigits = +numericParts[2];

    // Perform the division and format the result to a specified
    // number of decimal places (precisionDigits + 1).
    let decimalString = (numeratorVal / denominatorVal).toFixed(precisionDigits + 1) ;

    // Locate the index of the decimal point within the formatted string.
    const dotPosition = decimalString.indexOf('.');

    // Extract a specific segment of the decimal part.
    // This segment starts after the decimal point and excludes the very last character
    // of the toFixed result.
    decimalString = decimalString.substring(dotPosition + 1, decimalString.length - 1);

    // Calculate the sum of all individual digits within the 'decimalString'.
    // Each character is converted to a number before addition.
    let digitSum = decimalString
        .split('')
        .reduce(
            function(
                accumulatedSum,
                currentDigitChar
            )
            {
                return (
                    (+accumulatedSum)
                    +
                    (+currentDigitChar)
                );
            }
        );

    // Output the final calculated digit sum to the console.
    console.log(digitSum);
}