/*
 * This module encapsulates a primary routine for processing textual data.
 * It is designed to read content from standard input, parse it line by line,
 * and perform numerical computations on specific parts of each line.
 */

// Declare the main function responsible for data ingestion and processing
function ProcessInputData ( rawData )
{
    // Divide the entire received string into an array of distinct text segments,
    // using the newline character as the delimiter.
    const textSegments = rawData . split ( "\n" ) ;

    // Iterate through each of the obtained text segments by their index.
    for ( let idx in textSegments )
    {
        // For the current segment, split it into an array of string representations
        // of numbers, using a space character as the separator.
        const numStrings = textSegments [ idx ] . split ( " " ) ;

        // Convert the first two string representations into actual numerical values
        // and compute their aggregate sum.
        let totalValue = Number ( numStrings [ 0 ] ) + Number ( numStrings [ 1 ] ) ;

        // Print to the console the total count of digits present in the final sum.
        // This is achieved by converting the number back to a string and checking its length.
        console . log ( totalValue . toString ( ) . length ) ;
    }
}

// Invoke the primary data processing function.
// The data source is the standard input stream, which is read synchronously
// using the Node.js 'fs' module and interpreted as UTF-8 encoded text.
ProcessInputData (
    require ( "fs" )
        . readFileSync (
            "/dev/stdin" ,
            "utf8"
        )
) ;