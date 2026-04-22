/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 */
function     Main(   input   )
{
    // Initialize 'n' by converting the input to a number.
    var   n   =   Number( input ) ;

    var   t   =   1 ; // 't' will store the factorial of 'n'.

    var   count   =   0 ; // This counter will store the final result.

    // Calculate factorial of 'n'
    for  ( var  i = 1 ;   i <= n ;   i++ )
    {
        t *= i ;
    } // End of factorial calculation loop

    /*
     * 'firsty' array will store all divisors of t/2.
     * Note: The original code does not declare 'firsty' with 'var',
     * which makes it a global variable if not in strict mode.
     * This behavior is preserved as per Type I cloning rules.
     */
    firsty   =   [ ] ;

    // Populate 'firsty' with divisors of t/2
    for   (  var   i   =   1  ;   i   <=   ( t   /   2 )  ;   i++  )
    {
        // Check if 'i' is a divisor of 't'
        if   (  t   %   i   ==   0  )
        {
            firsty . push( i ) ; // Add divisor to the array
        }
    } // End of firsty population loop

    /*
     * Iterate through the elements in the 'firsty' array.
     * 'a' will be the index for each element.
     */
    for   (   a   in   firsty   )
    {
        var   count2   =   0 ; // Counter for divisors of (firsty[a] / 2)

        // Find divisors of (firsty[a] / 2)
        for   (  var   f   =   0  ;   f   <=   firsty[ a ]   /   2  ;   f++  )
        {
            // The original code has a potential bug here: f can be 0, leading to division by zero.
            // As per Type I cloning, this behavior is preserved.
            if   (   (   firsty[ a ]   /   2   )   %   f   ==   0   )
            {
                count2++ ; // Increment count2 if 'f' is a divisor
            }
        }

        // If count2 is exactly 75, increment the main 'count'
        if   (   count2   ==   75   )
        {
            count++ ;
        }
    } // End of outer loop for 'firsty' elements

    // Output the final count to the console.
    console . log( count ) ;
}

// Call the Main function with input read from stdin.
Main(   require( "fs" ).readFileSync( "/dev/stdin" , "utf8" )   ) ; // Input reading from standard input.