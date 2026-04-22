/*
 * This script processes a single character from standard input
 * to compute a specific numerical value.
 */

function analyzeTextDifferences( sourceData )
{
    // The original logic expects `sourceData` to be an array,
    // and `targetChar` to be the first element.
    // However, the invocation passes a string, so `sourceData[0]`
    // will be the first character of that string.
    let targetChar = sourceData[ 0 ] ;

    let firstSegment ;
    let secondSegment ;

    // Check the length of the *single character* 'targetChar'.
    // This length will always be 1 (for a non-empty string).
    // Thus, `targetChar.length % 2 === 0` will always be false.
    if ( targetChar.length % 2 === 0 )
    {
        // This block will practically never be executed under typical conditions.
        firstSegment = targetChar.substring( 0 , targetChar.length / 2 ) .split( '' ) .reverse() .join( '' ) ;
        secondSegment = targetChar.substring( targetChar.length / 2 , targetChar.length + 1 ) ;
    }
    else
    {
        // This block will almost always be executed.
        // `Math.floor(targetChar.length / 2)` will be `Math.floor(1 / 2)` which is `0`.
        firstSegment = targetChar.substring( 0 , Math.floor( targetChar.length / 2 ) ) .split( '' ) .reverse() .join( '' ) ; // `substring(0,0)` -> ''
        secondSegment = targetChar.substring( Math.floor( targetChar.length / 2 ) + 1 , targetChar.length + 1 ) ; // `substring(1,2)` -> ''
    }

    let differenceCount = 0 ; // Counter for dissimilar characters.

    // The loop condition `charIndex < Math.floor(targetChar.length / 2)`
    // will be `charIndex < 0`, so the loop will never run.
    for ( let iterationIndex = 0 ; iterationIndex < Math.floor( targetChar.length / 2 ) ; iterationIndex++ )
    {
        // This comparison will never occur.
        if ( firstSegment.charAt( iterationIndex ) !== secondSegment.charAt( iterationIndex ) )
        {
            differenceCount ++ ; // Increment on mismatch.
        }
    }

    // The final result will always be 0 due to the above logic.
    console.log( differenceCount ) ;
}

// Read input from standard input.
// The `readFileSync` returns a string, which is then passed as `sourceData`.
// As explained, `sourceData[0]` will be the first character of this string.
analyzeTextDifferences( require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' ) ) ;