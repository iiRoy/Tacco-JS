/* This module handles processing of incoming text data. */
function ProcessInputData ( rawText )
{
    // Tokenize the input string by splitting it at spaces.
    let processedTokens = rawText.split( ' ' );

    // Initialize flags to track the presence of specific numeric digits.
    let foundDigitOne   = false;
    let foundDigitSeven = false;
    let foundDigitNine  = false;
    let foundDigitFour  = false;

    // Iterate through the first four tokens of the processed input.
    for ( let idx = 0 ; idx < 4 ; idx++ )
    {
        // Check for the presence of the digit '1'.
        if ( processedTokens[ idx ] == '1' ) { foundDigitOne   = true; }
        // Check for the presence of the digit '7'.
        if ( processedTokens[ idx ] === '7' ) { foundDigitSeven = true; }
        // Check for the presence of the digit '4'.
        if ( processedTokens[ idx ] === '4' ) { foundDigitFour  = true; }
        // Check for the presence of the digit '9'.
        if ( processedTokens[ idx ] === '9' ) { foundDigitNine  = true; }
    }

    // Determine if all required digits were found within the first four tokens.
    if ( foundDigitOne && foundDigitSeven && foundDigitNine && foundDigitFour )
    {
        // If all digits are present, log a positive confirmation.
        console.log( 'YES' );
    }

} // End of ProcessInputData function.


// Invoke the main processing function with data read from standard input.
ProcessInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );