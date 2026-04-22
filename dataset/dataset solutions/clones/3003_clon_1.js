/*
 * This is a Type I clone of an existing JavaScript program.
 * It processes input to perform a simple calculation.
 * The core logic and identifiers remain absolutely identical.
 */

Main =  (  input  )  =>   {

    // The input is expected to be an array of strings.
    // We take the first element, which should be a space-separated string,
    // and split it into an array of individual string components.
    input    =    input[0]    .    split(' ')   ;

    /*
     * Declare and initialize variables 'a', 'b', and 't'
     * from the split input array.
     * These represent numerical values for calculation.
     */
    var   a    =    input[0]   ,
          b    =    input[1]   ,
          t    =    input[2]   ;

    // Calculate the floor division of 't' by 'a'.
    // This result is stored in the 'ans' variable.
    var   ans   =   Math.floor (  t   /   a  )   ;


    // Finally, print the product of 'ans' and 'b' to the console.
    console.log (  ans   *   b  )   ;

}   ;

// This section handles reading input from standard input
// and then calls the 'Main' function with the processed data.
Main (
    require (  "fs"  )
    .   readFileSync (  "/dev/stdin"  ,   "utf8"  )
    .   split (  '\n'  )
)   ;