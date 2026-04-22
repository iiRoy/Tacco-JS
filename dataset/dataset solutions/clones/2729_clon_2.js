/*
 * This module processes a single line of input data
 * to perform a specific mathematical calculation.
 * It reads space-separated numerical values and computes a result.
 */
function  ComputeResult ( sourceText )
{
    // The incoming raw string contains space-separated numeric values.
    // We convert this string into an array of actual numbers.
    // The original string parameter is reused to hold the parsed numeric array.
    sourceText = sourceText . split( " " ) . map( Number ) ;

    // Perform a ceiling division calculation.
    // The calculation involves the first two numbers from the parsed array.
    // Specifically, it's (first_number / (second_number + 1)), then rounded up.
    console . log( Math . ceil( sourceText[0] / ( sourceText[1] + 1 ) ) ) ;

} // End of ComputeResult function definition


// The program execution starts here.
// Read input from standard input using the Node.js 'fs' module,
// trim any leading/trailing whitespace characters from the received text,
// and then pass this cleaned string to our main processing function.
ComputeResult( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) . trim() ) ;