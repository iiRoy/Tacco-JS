// This function determines a financial outcome based on provided input data.
function computeFinancialOutcome(inputString)
{
    // Split the raw input string into an array of individual segments
    // using whitespace or newlines as delimiters.
    var       numericSegments       = inputString.split( /[\s\n]+/ );

    // Initialize a variable to accumulate the computed value.
    var finalTally = 0.0; /* Use a float for precision */

    // Evaluate the first condition based on the average of the first two segments
    // compared to the third segment.
    if ( ( parseFloat(numericSegments[0]) + parseFloat(numericSegments[1]) ) / 2.0 > parseFloat(numericSegments[2]) )
    {
        // If the condition is true, calculate a portion of the tally
        // involving the third segment, a constant factor, and the minimum of two subsequent segments.
        finalTally += parseFloat(numericSegments[2]) * 2.0 * Math.min( parseFloat(numericSegments[3]) , parseFloat(numericSegments[4]) );
    }
    else
    {
        // Otherwise, calculate a different portion of the tally
        // involving the sum of the first two segments and the minimum of two subsequent segments.
        finalTally += ( parseFloat(numericSegments[0]) + parseFloat(numericSegments[1]) ) * Math.min( parseFloat(numericSegments[3]) , parseFloat(numericSegments[4]) );
    }

    // Evaluate a second condition comparing the fourth and fifth segments.
    if ( parseFloat(numericSegments[3]) > parseFloat(numericSegments[4]) )
    {
        // If the fourth segment is greater, add a value derived from the first segment
        // multiplied by the difference between the fourth and fifth.
        finalTally += parseFloat(numericSegments[0]) * (parseFloat(numericSegments[3]) - parseFloat(numericSegments[4]));
    }
    else
    {
        // If the fifth segment is greater or equal, add a value derived from the second segment
        // multiplied by the difference between the fifth and fourth.
        finalTally += parseFloat(numericSegments[1]) * (parseFloat(numericSegments[4]) - parseFloat(numericSegments[3]));
    }

    // Output the final calculated tally to the console.
    console.log(finalTally);
}

// Execute the main calculation function with data read from standard input.
// The input is read as a UTF-8 string.
computeFinancialOutcome( require('fs').readFileSync('/dev/stdin', 'utf8') );