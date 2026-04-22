"use strict";

/* This is the primary function that processes the incoming data. */
function PrimaryProcess (dataSource)
{
    // First, split the entire input string into an array of lines.
    let textRows = dataSource.split('\n');

    /* From the first line, extract and convert numerical components. */
    let numericParts = textRows.shift().split(/\s+/).map( (item) => Number(item) );

    // Assign the extracted numbers to distinct variables for clarity.
    let valX = numericParts[0];
    let valY = numericParts[1];

    let resultValue = 0; // Initialize the variable that will store the final outcome.

    if (valX === valY) {
        /* If both input values are strictly identical, the result is simply that value. */
        resultValue = valX;
    }
    else if ( (valX + valY) % 2 === 0 )
    {
        // If the sum of the two values is an even number, apply a specific bitwise operation and decrement.
        resultValue = (valX ^ valY) - 1;
    }
    else {
        /* In all other cases (i.e., if the sum is odd), perform a simple bitwise XOR. */
        resultValue = valX ^ valY;
    }

    // Output the calculated result to the standard console.
    console.log(resultValue);
}

// Invoke the main processing routine, feeding it content read from standard input.
PrimaryProcess( require('node:fs').readFileSync('/dev/stdin', 'utf8') );