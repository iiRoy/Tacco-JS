/*
 * This JavaScript file contains a single function 'Main'
 * which processes input data according to specific rules.
 *
 * The purpose of this program is to calculate and output a result
 * based on several numerical inputs provided as a multi-line string.
 *
 * This structure ensures a clear separation between input handling
 * and the core logic of the problem.
 */
function         Main   (   input   )
{

    /*
     * First, the entire input string is broken down into an array of lines.
     * Each element in this 'input' array will correspond to one line
     * from the original multi-line input string.
     */
    input    =    input.split  (  "\n"  )   ;


    // Declare and initialize variables T, A, and B.
    // These variables will store arrays of strings,
    // obtained by splitting the first three lines of the input by space characters.
    var   T    =    input[0] .split   (   " "   )    ;

    var   A    =    input[1] .split   (   " "   )    ;

    var   B    =    input[2] .split   (   " "   )    ;


    // A loop iterates a fixed number of times (twice, for indices 0 and 1).
    // Within this loop, the string elements of T, A, and B arrays
    // at the current index 'i' are converted into their numerical equivalents.
    // This is crucial for performing mathematical operations later on.
    for  (  var   i   =   0  ;
            i   <   2   ;
            i++   )
    {
        T [ i ]    =    Number  (  T [ i ]  )   ;
        A [ i ]    =    Number  (  A [ i ]  )   ;
        B [ i ]    =    Number  (  B [ i ]  )   ;
    }


    /*
     * Calculation of 'sa1' and 'sa2'.
     * These variables represent intermediate results derived from the
     * numerical values in arrays T, A, and B.
     * 'sa1' is based on the first set of values (index 0).
     */
    var   sa1    =    T [ 0 ] * A [ 0 ]   -   T [ 0 ] * B [ 0 ]   ;

    /*
     * 'sa2' then incorporates 'sa1' along with the second set of values (index 1).
     * The specific arithmetic operations reflect the problem's requirements.
     */
    var   sa2    =    sa1   +   T [ 1 ] * A [ 1 ]   -   T [ 1 ] * B [ 1 ]   ;


    // This block of 'if-else if-else' statements determines the final output.
    // It checks various conditions involving 'sa1' and 'sa2'
    // to print specific messages or calculated numbers to the console.

    if  (  sa2   ==   0  )
    {
       // If sa2 is exactly zero, the output is 'infinity'.
       console . log  (  'infinity'  )   ;
    }
    else   if   (   sa1   *   sa2   >   0   )
    {
      // If the product of sa1 and sa2 is positive, the output is 0.
      console . log  (  0  )   ;
    }
    else   if   (   sa1   /   sa2   -   Math . ceil  (  sa1   /   sa2  )   ==   0   )
    {
      // This condition checks if sa1 is perfectly divisible by sa2,
      // or if sa1/sa2 is an integer.
      // If true, a specific calculation involving Math.ceil is performed.
      console . log  (  Math . ceil  (  sa1   /   sa2  )   *   2  )   ;
    }
    else
    {
      // For all other cases not covered by the preceding conditions,
      // a different calculation involving Math.ceil is executed.
      console . log  (  - Math . ceil  (  sa1   /   sa2  )   *   2   +   1  )   ;
    }

}


/*
 * The program execution begins here.
 * It reads the entire content of the standard input stream ('/dev/stdin')
 * as a UTF-8 encoded string.
 * This string is then passed as an argument to the 'Main' function,
 * initiating the data processing.
 */
Main   (   require  (  "fs"  )  . readFileSync  (  "/dev/stdin"  ,   "utf8"  )   )   ;