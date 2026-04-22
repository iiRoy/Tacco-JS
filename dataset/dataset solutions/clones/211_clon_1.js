/*
 * This JavaScript program calculates the number of trailing zeros
 * in the factorial of a given input number.
 * It reads numbers line by line from standard input.
 * The program terminates when it encounters the string '0' as input.
 *
 * This implementation adheres strictly to Type I cloning rules,
 * meaning only whitespace and comments are modified.
 */
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
var   lines   =   input . trim ( ) . split ( '\n' ) ;


// Declare a variable to hold each line read from the input.
var   line ;

// Begin processing each line from the 'lines' array.
// The 'shift()' method removes the first element from the array and returns it.
while   ( line   =   lines . shift ( ) )   {

    // If the current line is exactly '0', it signifies the end of input
    // according to the problem specification.
    if   ( line   ==   '0' )
        break ; // Exit the while loop immediately.


    // Initialize counters for the prime factors 2 and 5.
    // These are crucial for determining trailing zeros in factorials.
    cnt2   =   0 ;
    cnt5   =   0 ;


    // Convert the current line string to a number.
    // The unary plus operator (+) is a concise way to achieve this.
    var   n   =   + line ;


    // Loop from 1 up to the number 'n' (inclusive).
    // In each iteration, we analyze the current number 'i' for its prime factors.
    for   ( var   i   =   1 ;   i   <=   n ;   i ++ )   {
        var   tmp   =   i ; // Use a temporary variable to avoid modifying the loop counter 'i'.

        // Count how many times 2 is a factor of 'tmp'.
        // This loop continues as long as 'tmp' is evenly divisible by 2.
        while   ( tmp   %   2   ==   0 )   {
            tmp   /= 2 ; // Divide 'tmp' by 2.
            cnt2 ++ ;   // Increment the counter for factor 2.
        }


        // Count how many times 5 is a factor of 'tmp'.
        // This loop continues as long as 'tmp' is evenly divisible by 5.
        while   ( tmp   %   5   ==   0 )   {
            tmp   /=   5 ; // Divide 'tmp' by 5.
            cnt5 ++ ;   // Increment the counter for factor 5.
        }
    }

    // The number of trailing zeros in n! is determined by the minimum
    // count of its prime factors 2 and 5, because each pair of (2, 5) forms a 10.
    console . log ( Math . min ( cnt2 ,   cnt5 ) ) ;
}
// End of program logic.
/* This comment is just for more visual distinction. */