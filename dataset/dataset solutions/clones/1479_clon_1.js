/*
 * This JavaScript program processes a single numerical input
 * and generates a string by repeating "ACL" a specified number of times.
 * It demonstrates basic string manipulation and loop constructs.
 */
function     Main    (   input   )
{

    // The provided input string is first split into an array of lines.
    // Any resulting empty lines are subsequently removed using the Boolean filter.
    input   =   input   .   split   (   "\n"    )   .   filter  (   Boolean )   ;


    // The first element of the processed input array, which is expected to be
    // a string representation of a number, is converted into a numerical type.
    // This number, K, determines the repetition count.
    let     K   =   Number  (   input   [   0   ]   )   ;

    // An empty string variable `res` is initialized.
    // This variable will accumulate the repeated "ACL" string.
    let     res     =   ""  ;


    // A for-loop iterates K times.
    // In each iteration, the string "ACL" is appended to the `res` variable.
    for     (   let     i   =   0   ;   i   <   K   ;   i++   )
    {
        res     +=  "ACL"   ; // String concatenation operation
    }


    // Finally, the accumulated result string `res` is printed to the console.
    console .   log   (   res )   ;

}

// The `Main` function is invoked with the content read from standard input.
// The `fs` (file system) module is used to synchronously read the file
// located at "/dev/stdin", interpreting its content as UTF-8 encoded text.
Main    (   require (   "fs"    )   .   readFileSync (   "/dev/stdin"    ,   "utf8"  )   )   ;