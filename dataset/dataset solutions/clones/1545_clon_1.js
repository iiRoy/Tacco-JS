// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// All identifiers, operators, and expressions remain precisely the same.


/**
 * The main function processes a single line of input.
 * It determines if a given distance 'D' can be covered within time 'T'
 * at a speed 'S'.
 *
 * @param {string} lines - A string containing three space-separated values: D, T, S.
 */
const main =  lines  =>   {

    // Split the input string by space to get individual values.
    // Note: 'line' is implicitly declared as a global variable here,
    // as it's not declared with 'const', 'let', or 'var'.
    line =  lines . split (  " "  ) ;


    // Extract the distance 'D' from the first element.
    const   D   =   line [ 0 ] ;

    // Extract the available time 'T' from the second element.
    const   T   =   line [ 1 ] ;

    // Extract the speed 'S' from the third element.
    const   S   =   line [ 2 ] ;


    // Check if the total distance covered (Speed * Time) is greater than or equal to the required distance 'D'.
    if (   S * T   >=   D   )   {

        // If the condition is true, it means the distance can be covered.
        console . log (  'YES'  ) ;

    }   else   {

        // If the condition is false, the distance cannot be covered within the given time and speed.
        console . log (  'NO'  ) ;

    }

} ;


// The program execution starts here.
// It reads input synchronously from standard input ('/dev/stdin')
// using Node.js's 'fs' module, decodes it as UTF-8,
// and then passes it to the 'main' function.
main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,  'utf8'  )  ) ;