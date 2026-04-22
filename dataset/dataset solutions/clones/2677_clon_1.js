/*
 * This JavaScript code processes a single numerical input.
 * It calculates a value 'n' based on the magnitude of the input 'N'.
 * The logic determines 'n' through a series of conditional checks.
 * Input data is expected to be provided as a string, which will be parsed.
 */
function Main ( input )
{
    // The input string is first split by spaces.
    // In this specific problem context, it's assumed there's only one number.
    input = input.split ( " " ) ;


    // Convert the first part of the input string to an integer (base 10).
    // parseInt is crucial for converting string representations of numbers.
    var N = parseInt( input[0] , 10 ) ;


    // Initialize the variable 'n' which will store the calculated result.
    var n = 0 ;


    // Begin the series of conditional checks to determine the value of 'n'.
    // Each 'if' or 'else if' block handles a specific range for 'N'.

    if ( N <= 9 )
    {
        // If N is a single-digit number.
        var n = N ;
    }
    else if ( N >= 10 && N <= 99 )
    {
        // If N is a two-digit number.
        n = 9 ;
    }
    else if ( N >= 100 && N <= 999 )
    {
        // If N is a three-digit number.
        n = N - 99 + 9 ;
    }
    else if ( N >= 1000 && N <= 9999 )
    {
        // If N is a four-digit number.
        n = 909 ;
    }
    else if ( N >= 10000 && N <= 99999 )
    {
        // If N is a five-digit number.
        n = N - 9999 + 909 ;
    }
    else
    {
        // For any number N greater than 99999.
        var n = 90909 ;
    }


    // Output the final calculated value of 'n' to the console.
    console.log ( n ) ;
}


// ********************************************************************************
// * The following lines handle standard input/output and should not be modified. *
// * It reads the entire input from stdin and passes it to the Main function.     *
// ********************************************************************************
Main( require("fs").readFileSync("/dev/stdin" , "utf8") ) ;