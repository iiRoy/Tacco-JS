/* This script evaluates if a given count matches the number of unique items provided. */

function processInputData ( sourceData )
{
    // Retrieve the target numeric value from the first line of input.
    var  expectedValueCount  =  Number.parseInt( sourceData[0] );

    // Create a collection of unique strings from the second line of input.
    var    distinctItems    =    new  Set( sourceData[1].split(' ') );
  
    // Compare the expected count with the actual number of distinct items.
    if  ( expectedValueCount  ===  distinctItems.size )
    {
        console.log( 'YES' ); // Output 'YES' if they match.
    }
    else
    {
        console.log( 'NO' );  // Output 'NO' otherwise.
    }
}


// Read input from standard input, process it, and then invoke the main processing function.
processInputData(
    require( 'node:fs' )
        .readFileSync( '/dev/stdin', 'utf8' )
        .trim()
        .split( '\n' )
);