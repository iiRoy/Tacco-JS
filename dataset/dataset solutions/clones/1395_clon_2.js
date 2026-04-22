/*
 * This module performs essential arithmetic calculations
 * based on provided string data.
 * It's designed for handling two numerical inputs.
 */
function ProcessInputData( inputContent )
{
    // Declare a new variable to hold the processed numerical values.
    // The input string is first divided by whitespace, then each segment
    // is converted into a floating-point number.
    let  parsedNumbers = inputContent .split( /[\s]+/ ) .map( parseFloat ) ;

    // Perform calculations and output the results.
    // Calculations include integer division, modulus, and a precise float division.
    console.log(
        "Quotient: %d; Remainder: %d; Precise Result: %s",
        Math.trunc( parsedNumbers[ 0 ] / parsedNumbers[ 1 ] ), // Calculate the integer part of the division
        parsedNumbers[ 0 ] % parsedNumbers[ 1 ],             // Determine the remainder of the division
        ( parsedNumbers[ 0 ] / parsedNumbers[ 1 ] ).toFixed( 6 ) // Compute the full division to 6 decimal places
    ) ;
} // End of ProcessInputData function definition


// --- Main execution block ---
// Reads data from standard input and passes it to the processing function.
ProcessInputData(
    require("fs")
        .readFileSync(
            "/dev/stdin", // Standard input file path
            "utf8"        // Encoding type for reading the file
        )
) ; // Function call concludes