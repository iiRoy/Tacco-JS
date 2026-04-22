// This script serves to analyze a specific character sequence, determining the maximum accumulated value.
function  processInput( rawData )
{
    // The initial raw string data is first converted into an array of individual characters.
    let  charArray  =  rawData.split( '' ) ;

    // The very first character of the input is designated as the indicator for the sequence's effective processing length.
    // Note: This assumes the initial character is a numeric digit represented as a string.
    const  sequenceLength  =  charArray[0] ;

    // An accumulator variable, starting at zero, to track the current calculated value.
    let  currentValue  =  0 ;

    // A collection to store each intermediate state of the 'currentValue' during processing.
    let  valueTrace  =  new Array() ;

    // We iterate through the relevant portion of the character array.
    // The loop runs for a number of times determined by 'sequenceLength'.
    // The characters being evaluated are from the second position onwards (index 1 in charArray).
    for  ( let  idx = 0 ;  idx < sequenceLength ;  idx++ )
    {
        // Examine the character at the position `idx + 1` within the character array.
        // This ensures processing starts from the character immediately following the 'sequenceLength' indicator.
        if  ( charArray[ idx + 1 ]  ===  'I' )
        {
            // If an 'I' character is encountered, the current value is incremented.
            currentValue++ ;
        }
        else
        {
            // For any other character (e.g., 'D'), the current value is decremented.
            currentValue-- ;
        }

        // Each updated 'currentValue' is added to our historical trace.
        valueTrace.push( currentValue ) ;
    }

    // Finally, the highest recorded value from the entire trace is printed to the console.
    console.log( Math.max( ...valueTrace ) ) ;
}

// The processing function is invoked with data acquired from the standard input stream.
processInput( require( "fs" ) . readFileSync( "/dev/stdin" ,  "utf8" ) ) ;