/* This module handles numerical data processing. */
const processInputData =    (  sourceText   ) =>
{
    // First, parse the raw text data into an array of numbers.
    // Each string element is converted to its numerical representation.
    const    numericValues = sourceText.split(' ')     .map( currentStr => Number( currentStr )    );

    /*
     * Determine an intermediate value based on the first two parsed numbers.
     * If the first number is greater than the second, the value is zero.
     * Otherwise, it's the ratio of the second to the first number.
     */
    const calculatedResult = numericValues[0] > numericValues[1] ? 0 : numericValues[1] / numericValues[0];

    // Finally, output the computed value to the standard console.
    // The output is either the third number if the calculated result is greater or equal,
    // or the integer part of the calculated result otherwise.
    console.log( calculatedResult >= numericValues[2] ? numericValues[2] : parseInt( calculatedResult ) );
};

// Initiate the data processing by reading from standard input.
processInputData( require('fs') . readFileSync(  '/dev/stdin'  ,   'utf8'  ) );