/*
 * This JavaScript file contains a solution to a programming problem.
 * This particular version is a Type I clone of an original source file.
 * According to the Type I definition, the code fragments are
 * exactly equal in their logical and structural components.
 * The only permissible variations are in whitespace (spaces, tabs, newlines)
 * and comments (added, removed, or modified).
 * This clone aims to demonstrate significant visual difference through these allowed changes.
 */


function     Main  (

    input     // The primary input string provided to the function.

) {  //  The  Main  function's  body  begins  here.


    //  First, we process the raw input string.
    //  It's typically expected to be multi-line, so we split it
    //  into an array of strings, using the newline character as a delimiter.
    const   data    =   input.split (   "\n"    )   ;


    //  Next, we parse the first line of the 'data' array.
    //  This line is assumed to contain space-separated values.
    const   fLine   =   data    [   0   ]   .   split   (   " " )   ;


    //  Similarly, the second line of the 'data' array is also parsed.
    //  This line is also expected to contain space-separated values.
    const   sLine   =   data    [   1   ]   .   split   (   ' ' )   ;


    //  For debugging or verification, the parsed 'fLine' and 'sLine'
    //  arrays are printed to the console.
    console .   log   (   fLine   )   ;
    console .   log   (   sLine   )   ;


    //  The 'sLine' array is assigned to a new constant named 'numbers'.
    //  This makes the intent clearer for subsequent operations.
    const   numbers =   sLine   ;


    /*
     *  Here, we calculate the sum of the elements in the 'numbers' array.
     *  It's critical to note that if the elements are strings (which they are
     *  after `split`), the '+' operator within the `reduce` function
     *  will perform string concatenation rather than numerical addition.
     *  This behavior is preserved exactly as it was in the original code,
     *  adhering strictly to Type I cloning rules.
     */
    const   sum     =   numbers .   reduce  (

        function    (   a   ,   b   )   {

            return  a   +   b   ;   //  This will concatenate strings if 'a' and 'b' are strings.

        }

    )   ;  //  End of the 'reduce' method call and 'sum' assignment.


    //  Finally, a conditional check is performed.
    //  The calculated 'sum' is compared against the first element of 'fLine'.
    //  This comparison will also be string-based if both operands are strings.
    if  (

        sum     >   fLine   [   0   ]

    ) {

        //  If the condition evaluates to true, print "Yes" to the console.
        console .   log   (   "Yes"   )   ;

    } else  {

        //  Otherwise (if the condition is false), print "No" to the console.
        console .   log   (   "No"    )   ;

    }  //  End of the if-else control structure.


}  //  The  Main  function  definition  concludes  here.


//  This is a standard boilerplate line commonly found in competitive programming setups.
//  It's responsible for reading the entire content of the standard input stream
//  (typically `/dev/stdin` on Linux-like systems) as a UTF-8 encoded string.
//  This string is then passed as the sole argument to the `Main` function,
//  initiating the program's execution flow.
Main  (   require (   "fs"    )   .   readFileSync  (   "/dev/stdin"    ,   "utf8"  )   )   ;