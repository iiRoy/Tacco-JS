/*
 * This is a Type I clone of the original JavaScript function.
 * All functional aspects, identifiers, and expressions remain identical.
 * Only whitespace and comments have been altered significantly.
 */

function   MainA  (  input  )   { // Function definition starts here

    // Declare a variable 'num' and convert the input to a number.
    let   num   =   Number ( input ) ;

    // Initialize an empty string to store the final answer.
    let   answer   =   ""   ;

    /*
     * Define a constant string 'ACL' which will be appended.
     * This string represents the "AtCoder Library" or a similar concept.
     */
    const   ACL   =   "ACL"   ;


    // Loop 'num' times to build the 'answer' string.
    for  ( let   i = 0 ;   i < num ;   i++ )
    {
        // Append the 'ACL' string to the 'answer' in each iteration.
        answer   +=   ACL   ;
    }


    // Output the final concatenated string to the console.
    console . log ( answer ) ;

} // End of MainA function definition


// Call the MainA function with input read from standard input.
// This part handles reading input from /dev/stdin for competitive programming environments.
MainA ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;