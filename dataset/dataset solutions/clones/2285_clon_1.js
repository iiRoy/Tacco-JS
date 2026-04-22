/* This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * All identifiers and logic remain exactly the same.
 */

// Define the main function that processes the input
function main (  input  ) {
    // Parse N from the first line of input.
    // The '-0' is a common trick to convert a string to a number.
    var N = input[0] . split(" ") [0] - 0 ;

    // Parse M from the first line of input, similar to N.
    var M = input[0] . split(" ") [1] - 0 ;

    // Process the second line of input: split by space,
    // then map each value to half of its numeric value.
    var list = input[1] . split(" ") . map( v => v / 2 ) ;

    // Calculate the least common multiple (LCM) of the processed list.
    var l = lcm ( list ) ;

    // Log the final result to the console.
    // The calculation involves truncating divisions.
    console . log ( Math . trunc ( M / l ) - Math . trunc ( M / ( l * 2 ) ) ) ;
}


// This helper function calculates the least common multiple (LCM)
// for an array of numbers.
function lcm ( args ) {
    // Assign the input arguments to a local variable 'a'.
    var a = args ;

    // Define a helper arrow function 'g' for the greatest common divisor (GCD).
    // This uses the Euclidean algorithm recursively.
    var g = ( n , m ) => m ? g ( m , n % m ) : n ;

    // Define a helper arrow function 'l' for the least common multiple (LCM)
    // using the GCD: LCM(n,m) = (n*m) / GCD(n,m).
    var l = ( n , m ) => n * m / g ( n , m ) ;

    // Initialize the answer with the first element of the array.
    var ans = a [ 0 ] ;

    // Iterate through the rest of the array elements
    // to calculate the cumulative LCM.
    for ( var i = 1 ; i < a . length ; i ++ ) {
        ans = l ( ans , a [ i ] ) ; // Update ans with the LCM of current ans and a[i]
    }
    // Return the final calculated LCM.
    return ans ;
} // End of lcm function definition


// This is the entry point of the script.
// It reads input from stdin, processes it, and calls the main function.
main (
    require ( 'fs' )
        . readFileSync ( '/dev/stdin' , 'utf8' )
        . trim ( )
        . split ( "\n" )
) ; // Call the main function with the prepared input