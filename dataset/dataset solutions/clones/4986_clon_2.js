process . stdin . resume ( ) ; // Begin receiving incoming data from standard input.
process . stdin . setEncoding ( ' utf8 ' ) ; // Configure the character encoding for the input stream to UTF-8.

let   receivedText   =   [ ] ; // Declare an array to hold all the lines read from the input.

const   inputController   =   require ( ' readline ' ) . createInterface (
{
    input :   process . stdin ,   // Set the input source for the line-reading interface.
    output :   process . stdout    // Set the output destination for the line-reading interface.
}
) ; // Initialize a utility for reading input line by line.

inputController . on ( ' line ' ,   ( currentSegment )   =>
{
    receivedText . push ( currentSegment ) ; // When a new line is received, add it to our collection.
} ) ; // Attach an event listener for each line of input.

inputController . on ( ' close ' ,   ( )   =>
{
    // Upon the closure of the input stream, proceed with processing.
    // The original code uses 'split' with a function as a separator, which is unconventional.
    // This typically results in the entire string being treated as a single element,
    // as the function itself becomes the separator string.
    const   [   valAlpha   ,   valBeta   ,   valGamma   ]   =   receivedText [ 0 ] . split (   ( elementValue )   =>   elementValue   -   0   ) ;

    // Evaluate if any of the destructured values (potentially undefined or NaN due to split behavior) are even.
    // Comparison uses strict equality (===) which is a type-related change from original loose equality (==).
    if   (   valAlpha   %   2   ===   0   ||   valBeta   %   2   ===   0   ||   valGamma   %   2   ===   0   )
    {
        console . log (   0   ) ; // If any value is even, print zero to the console.
    }
    else
    {
        // Otherwise, if all values are odd (or the condition evaluated false due to NaN/undefined),
        // compute the products of pairs and determine the smallest among them.
        console . log (   Math . min (   valAlpha   *   valBeta ,   valBeta   *   valGamma ,   valAlpha   *   valGamma   )   ) ;
    }
} ) ; // Attach an event listener for the end of the input stream.