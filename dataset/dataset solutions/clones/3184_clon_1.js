// This function processes the entire input data provided as a string.

function   Main   ( input )
{
    // Declare a variable 'num' to store the processed numbers from the input string.
    var   num   =   input . split ( " " ) ;

    // Iterate through the array to convert each string element into an integer.
    for   ( var   n = 0 ;   n < num . length ;   n ++ )
    {
        num [ n ]   =   parseInt ( num [ n ] ) ;
    }

    // Initialize a variable 'output' which will hold the final computed value.
    var   output ;

    // Evaluate a condition based on the values of the first two numbers.
    if   ( num [ 1 ] % num [ 0 ]   ==   0 )
    {
        // If the second number is perfectly divisible by the first, perform an addition.
        output   =   num [ 1 ]   +   num [ 0 ] ;
    }
    else
    {
        // Otherwise, if there is a remainder, perform a subtraction.
        output   =   num [ 1 ]   -   num [ 0 ] ;
    }

    // Print the final calculated result to the standard output.
    console . log ( output ) ;
}

/* Do not modify the following line. This part handles reading from standard input and invoking the Main function. */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;