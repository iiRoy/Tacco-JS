/* This is a Type I clone example.
 * The original code calculates a specific value based on input.
 * All identifiers, operators, and expressions remain strictly identical.
 */
function Main ( input )
{
    // The 'input' parameter will contain the entire input data as a single string.

    // First, split the input string into an array of lines.
    input = input . split ( "\n" ) ;


    // Parse the first line to get the integer 'n'.
    var n = parseInt ( input [ 0 ] , 10 ) ;

    // Split the second line to get an array of strings 'x'.
    var x = input [ 1 ] . split ( " " ) ;

    // Initialize a counter variable.
    var count = 0 ;

    // Define a modulo constant. This is a common large prime number.
    var a = 1000000007 ;

    // Convert string elements of 'x' to numbers.
    for ( var i = 0 ; i < n ; i ++ )
    {
        x [ i ] = Number ( x [ i ] ) ; // Convert the current element to a numeric type.
    }

    // Now, perform the main calculation.
    // This involves nested loops to calculate XOR sums of pairs.
    for ( var i = 0 ; i < n - 1 ; i ++ )
    {
        for ( var j = i + 1 ; j < n ; j ++ )
        {
            // Add the bitwise XOR result of x[i] and x[j] to 'count'.
            count += x [ i ] ^ x [ j ] ;
        }
    }

    // Apply modulo operation to the final count to keep it within bounds.
    count = count % a ;

    // Output the final calculated value to the console.
    console . log ( count ) ;
}


// * This line and below should not be modified in production environments.
// * It handles reading input from standard input and calling the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;