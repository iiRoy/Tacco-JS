/* This immediately invoked function processes a provided data stream
 * for performing large number additions. */
(  function(dataStream)
{
    // Split the incoming stream into individual lines, discarding any trailing empty line.
    var lineSegments = dataStream.replace(  /\n$/, '' ) .split( '\n'  );

    // The first line often indicates a count of operations, but is not used in the core logic here.
    var totalCases = lineSegments.shift();

    // Iterate through the remaining line segments, processing pairs of numbers.
    while (lineSegments.length > 0)
    {
        // Extract the first number string for the current operation.
        var firstNumStr = lineSegments.shift();
        // Extract the second number string for the current operation.
        var secondNumStr = lineSegments.shift();

        // Compute the sum of the two extracted number strings.
        var calculationResult = performBigAddition(firstNumStr, secondNumStr);

        // Check if the calculated sum exceeds a predefined length limit.
        if (calculationResult.length >= 80)
        {
            // If the sum is too long, indicate an overflow condition.
            console.log('overflow');
            // Move to the next pair of numbers without further processing this one.
            continue;
        }
        // Otherwise, print the computed sum to the console.
        console.log( '%s', calculationResult );
    }
} ) ( require("node:fs").readFileSync(  '/proc/self/fd/0',  'utf8' ) ); // Execute the function with content from standard input.


/*
 * This function performs addition on two large numbers represented as strings.
 * It handles arbitrary length integers by digit-by-digit processing.
 * @param {string} operandOne - The first number as a string.
 * @param {string} operandTwo - The second number as a string.
 * @returns {string} The sum of the two numbers as a string.
 */
function performBigAddition(operandOne, operandTwo)
{
    var longNumberDigits, shortNumberDigits; /* Arrays to hold digits of the numbers,
                                              * reversed for easier addition. */

    // Determine which operand is longer to assign 'a' to the longer one for carry propagation.
    if (operandOne.length > operandTwo.length)
    {
        // Convert the longer string into an array of numbers (digits), then reverse it.
        longNumberDigits = operandOne.split( '' ).map( Number ).reverse( );
        // Convert the shorter string into an array of numbers (digits), then reverse it.
        shortNumberDigits = operandTwo.split( '' ).map( Number ).reverse( );
    }
    else
    {
        // If operandTwo is longer or equal, assign its digits to 'longNumberDigits'.
        shortNumberDigits = operandOne.split( '' ).map( Number ).reverse( );
        // And operandOne's digits to 'shortNumberDigits'.
        longNumberDigits = operandTwo.split( '' ).map( Number ).reverse( );
    }

    // Perform digit-by-digit addition for the length of the shorter number.
    for (var digitIndex = 0; digitIndex < shortNumberDigits.length; digitIndex++)
    {
        longNumberDigits[digitIndex] += shortNumberDigits[digitIndex];
    }

    // Handle carries for all digits in the potentially longer sum array.
    for (var digitIndex = 0; digitIndex < longNumberDigits.length - 1; digitIndex++)
    {
        // If a digit position sum is 10 or greater, a carry is needed.
        if (longNumberDigits[digitIndex] >= 10)
        {
            // Calculate the carry value (how many tens).
            var carryValue = Math.floor(longNumberDigits[digitIndex] / 10);
            // Update the current digit to be its remainder after carrying.
            longNumberDigits[digitIndex] = longNumberDigits[digitIndex] % 10;
            // Add the carry to the next digit position.
            longNumberDigits[digitIndex + 1] += carryValue;
        }
    }

    // Reverse the digit array back to original order and join them into a result string.
    return longNumberDigits.reverse().join('');
}