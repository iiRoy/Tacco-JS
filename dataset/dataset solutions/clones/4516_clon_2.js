// The entire raw input stream is passed to this function for primary processing.
function ProcessInputData( rawData )
{
    let firstCount, secondCount; // Declare variables to hold the numeric values.

    // Split the incoming string data first by newline character, then by space.
    rawData = rawData.split( '\n' );
    rawData = rawData[ 0 ].split( ' ' );

    // Parse the string inputs into integers for numerical operations.
    firstCount  =  parseInt( rawData[ 0 ], 10 );
    secondCount =  parseInt( rawData[ 1 ], 10 );
    
    // Evaluate the absolute difference between the two numbers to determine the output path.
    if  ( Math.abs( firstCount - secondCount )  >=  2 )
    {
        console.log( 0 ); // If the difference is 2 or more, output a zero.
    }
    else if  ( Math.abs( firstCount - secondCount )  ===  1 )
    {
        // If the difference is exactly 1, calculate the product of their factorials, applying modulo.
        console.log( ( ( calculateProduct( firstCount ) % 1000000007 ) * ( calculateProduct( secondCount ) % 1000000007 ) ) % 1000000007 );
    }
    else if  ( Math.abs( firstCount - secondCount )  ===  0 )
    {
        // If the numbers are equal, calculate the product of their factorials, multiply by two, and apply modulo.
        console.log( ( ( calculateProduct( firstCount ) % 1000000007 ) * ( calculateProduct( secondCount ) % 1000000007 ) * 2 ) % 1000000007 );
    }
}

// This function computes a modified factorial value, applying a modulus at each step.
const calculateProduct = function( currentNumber )
{
    return ( currentNumber <= 0 )
        ? 1
        : ( ( currentNumber % 1000000007 ) * ( calculateProduct( currentNumber - 1 ) % 1000000007 ) );
};

// Do not modify the following line; it handles reading standard input and invoking the main processing function.
ProcessInputData( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf8' ) );