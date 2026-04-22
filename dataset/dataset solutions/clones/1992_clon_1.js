/*
 * This is a JavaScript program designed to process textual input.
 * The primary function, 'Main', encapsulates the core logic.
 * It identifies and counts specific patterns within a given string.
 */

function    Main  (  input  )   {

    // The initial 'input' is a single string.
    // We split it into an array of strings based on newline characters.
    input  =  input.split ( "\n" )  ;

    /*
     * The first element of the 'input' array is expected to be a number.
     * We parse it as an integer, ensuring it's interpreted in base 10.
     * This 'num' variable likely dictates the range for subsequent operations.
     */
    var     num     =   parseInt ( input [ 0 ] ,   10 )    ;

    // The second element of the 'input' array is treated as a string.
    // This 'str' variable is the sequence of characters we will analyze.
    var     str     =   input [ 1 ] ;

    // Initialize a counter variable.
    // This variable will accumulate the total number of valid combinations found.
    var     count   =   0   ;


    // Begin a series of nested loops to iterate through all possible unique triplets (i, j, k).
    // The outer loop iterates with 'i' from 1 up to 'num'.
    for  (  var   i   =   1   ;    i   <=   num   ;   ++i  )   {

        // The middle loop iterates with 'j', starting from the value immediately after 'i', up to 'num'.
        for  (  var   j   =   i   +   1   ;    j   <=   num   ;   ++j  )   {

            // The inner loop iterates with 'k', starting from the value immediately after 'j', up to 'num'.
            for  (  var   k   =   j   +   1   ;    k   <=   num   ;   ++k  )   {

                // First condition check:
                // We are looking for triplets (i, j, k) that do NOT form an arithmetic progression.
                // This means the difference between k and j must not be equal to the difference between j and i.
                if  (  k   -   j   !=   j   -   i  )   {

                    // If the first condition is met, proceed to check character distinctness.
                    // Note: Array indices in JavaScript are 0-based, so we use (index - 1).

                    // Second condition check:
                    // The character at position (i-1) in 'str' must be different from the character at position (j-1).
                    if  (  str [ i   -   1 ]   !=   str [ j   -   1 ]  )   {

                        // Third condition check:
                        // The character at position (i-1) in 'str' must be different from the character at position (k-1).
                        if  (  str [ i   -   1 ]   !=   str [ k   -   1 ]  )   {

                            // Fourth condition check:
                            // The character at position (j-1) in 'str' must be different from the character at position (k-1).
                            // If all these character distinctness conditions hold, then all three characters are unique.
                            if  (  str [ j   -   1 ]   !=   str [ k   -   1 ]  )   {
                                // If all four conditions (one arithmetic, three character distinctness) are satisfied,
                                // we increment our counter. This combination is a valid match.
                                count ++ ;
                            }
                        }
                    }
                }
            }
        }
    }


    // Once all possible combinations of (i, j, k) have been evaluated,
    // the final accumulated 'count' is printed to the standard output.
    console.log ( count ) ;
}

/*
 * This section is responsible for reading the input data.
 * It uses Node.js's built-in 'fs' (file system) module.
 * The input is read synchronously from '/dev/stdin' (standard input),
 * and it's expected to be encoded in UTF-8 format.
 * The 'Main' function is then invoked with this read input.
 */
Main  (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )  )  ;

// The program concludes after the 'Main' function has finished execution.