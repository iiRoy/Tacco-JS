// This function serves as the primary entry point for processing the given data.
function solveProblem(  receivedText  )
{
    // First, we break down the entire input string into an array of individual lines.
    let textLines = receivedText.split( '\n' );

    // The first line contains the divisor value, which we parse as a number.
    const modulusFactor =   Number(textLines[0])  ;

    // The second line specifies a numerical range. We parse its two components.
    const [ rangeStart, rangeEnd ] = textLines[1].split(' ').map(Number);

    // We then proceed to iterate through each number within the specified range, inclusive.
    for ( let currentNum = rangeStart; currentNum <= rangeEnd; currentNum++ )
    {
        // For every number, we check if it is perfectly divisible by our modulus factor.
        if ( ( currentNum % modulusFactor ) === 0 )
        {
            // If a number satisfies the divisibility condition, we output a success message.
            console.log(  'MATCH_FOUND'  );
            // And immediately terminate the function, as our goal is achieved.
            return;
        }
    }

    // Should the loop complete without finding any number divisible by the modulus factor,
    // we then output a failure message.
    console.log('NO_MATCH');
}

// Here, we invoke the main processing function, feeding it content read from standard input.
solveProblem(  require('fs').readFileSync('/dev/stdin', 'utf8').trim()  );