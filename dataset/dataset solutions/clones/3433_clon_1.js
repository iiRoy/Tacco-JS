/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the Type I definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Therefore, all identifiers, variable names, function names, operators,
 * and expressions remain completely unchanged.
 *
 * The only modifications are extensive changes in:
 * - Whitespace (indentation, spacing around operators, parentheses, etc., blank lines).
 * - Comments (adding new comments to describe parts of the code).
 */

// This function, named 'f', computes the factorial of the input integer 'k'.
function    f ( k )
{
    // Initialize a variable 'j' to 1; this will store the factorial result.
    var     j = 1;

    // Loop from 'i' equals 1 up to 'k' (inclusive).
    for ( var i = 1 ; i <= k ; i++ )
    {
        // Multiply 'j' by the current value of 'i' in each iteration.
        j *= i;
    }

    // Return the final calculated factorial value.
    return j;
}



// The 'get75n' function counts how many divisors 'i' of 'k' (where 'i' < N) exist.
function get75n ( k )
{
    // Initialize a counter, which will store the number of specific divisors.
    var counter         = 0 ;

    // Iterate through numbers starting from 1 up to (but not including) N.
    for ( var i = 1 ; i < N ; i++ )
    {
        // Check if 'i' is an exact divisor of 'k' (i.e., the remainder is 0).
        if ( k % i === 0 )
        {
            // If 'i' is a divisor, increment the counter.
            counter++;
        }
    }

    // Return the final count of divisors found.
    return counter ;
}




// The 'main' function serves as the entry point for the program's logic.
function main ( arg )
{
    // Process the input argument: convert it to a number after splitting by newline.
    // It assumes the first line of the input is the number to be processed.
    arg     =   Number( arg . split ( "\n" ) [ 0 ] ) ;

    // Declare and initialize an array named 'master'. This array is not used later.
    var master = [ 0 , 3 , 5 , 7 ] ;

    // Initialize a 'counter' variable to 0; this will hold the final result.
    var counter = 0 ;

    // Calculate the value of 'N' by calling the 'f' (factorial) function with 'arg'.
    // 'N' is implicitly declared as a global variable here.
    N = f( arg ) ;

    // Begin a loop that iterates from 'i' equals 1 up to (but not including) 'N'.
    for ( var i = 1 ; i < N ; i++ )
    {
        // Inside the loop, check if 'i' is an exact divisor of 'N'.
        if ( N % i === 0 )
        {
            // If 'i' is a divisor of 'N', then call 'get75n' with 'i' as an argument.
            // Check if the result of 'get75n(i)' is exactly 75.
            if ( get75n ( i ) === 75 )
            {
                // If both conditions are met, increment the main 'counter'.
                counter++;
            }
        }
    }

    // Finally, print the accumulated 'counter' value to the console.
    console . log ( counter ) ;
}

// Invoke the 'main' function, providing it with content read from standard input.
// The 'fs' module is used to read the file at '/dev/stdin' as UTF-8.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;