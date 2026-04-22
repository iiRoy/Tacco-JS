/*
 * This is a Type I clone of the original JavaScript code provided.
 * All core functional elements, such as variable names, function names,
 * operators, and expressions, have been preserved exactly as they were.
 * The only modifications made are to whitespace (indentation, spacing,
 * and blank lines) and comments (added, modified, or removed) to ensure
 * the code appears visually distinct while maintaining perfect logical
 * and structural equivalence to the source.
 */

// Define the primary function that will process the entire dataset.
// The 'input' parameter will contain all the raw input data as a single string.
function Main ( input )
{
    // The input string is typically multiline. We split it into an array
    // where each element corresponds to a line from the original input.
    input = input . split ( "\n" ) ;

    // For numerical operations, it's crucial to convert string representations
    // into actual integer types. 'parseInt' is employed here to convert the
    // first line of input (input[0]) into a base-10 integer.
    var n = parseInt ( input [ 0 ] , 10 ) ;

    // This loop iterates through possible divisors from 9 down to 1.
    // It seeks to find if 'n' can be expressed as a product of two single-digit numbers.
    for ( i = 9 ; i > 0 ; i -- )
    {
        // Check if 'n' is perfectly divisible by the current value of 'i'.
        if ( n % i == 0 )
        {
            // If 'n' is divisible by 'i', further check if the quotient (n / i)
            // is also a single-digit number (i.e., less than 10).
            if ( n / i < 10 )
            {
                // If both conditions are met, it means 'n' is a product of two
                // single-digit numbers (i and n/i). Output 'Yes' and exit the loop.
                console . log ( 'Yes' ) ;
                break ;
            }
            else
            {
                // If 'n' is divisible by 'i', but the quotient (n / i) is not
                // a single-digit number, then this specific 'i' does not satisfy
                // the condition for forming a product of two single-digit numbers.
                // Output 'No' and exit the loop, as the problem implies we only
                // need to find one such pair.
                console . log ( 'No' ) ;
                break ;
            }
        }
    }
}

// The following section is standard boilerplate for competitive programming
// environments in JavaScript. It reads all data from standard input and
// passes it to the 'Main' function. This part should generally not be altered.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;