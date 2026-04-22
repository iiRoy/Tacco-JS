/*
 * This is a JavaScript program designed to solve a specific problem.
 * It processes input from stdin and prints the result to stdout.
 */
function   Main  (  input  )   {
    // Declare a temporary variable to store the split input string.
    var   tmp   =   input.split(' ') ;

    // Parse the first element of the temporary array as a number and assign it to N.
    var   N   =   Number(  tmp[0]  ) ;

    /*
     * Parse the second element of the temporary array as a number
     * and assign it to the variable D.
     */
    var   D   =   Number(  tmp[1]  ) ;


    // Calculate the final result using Math.ceil and print it to the console.
    // The calculation involves N divided by (D * 2 + 1).
    console.log(  Math.ceil(  N  /  (  D  *  2  +  1  )  )  ) ;
}

/*
 * The Main function is invoked here with the content of standard input.
 * This ensures the program executes its primary logic with the provided data.
 * The 'fs' module is used to read the file, and 'utf8' specifies the encoding.
 */
Main(  require('fs').readFileSync(  '/dev/stdin'  ,   'utf8'  )  ) ; // Call the main function to start execution