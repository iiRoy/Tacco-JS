/*
 * This JavaScript code processes an input string to find the minimum number of
 * operations required to transform it into a string consisting of only one repeating character.
 * The 'input' parameter is expected to contain the entire input data.
 */
function Main( input ) {

    var t; /* Declare the main string variable 't' */

    var input = input . split ( "\n" ) ; /* The input string is split by newline characters.
                                         The original 'input' parameter is re-assigned here
                                         with the result of the split operation. */

    t = input [ 0 ] ; /* The first line of the input is taken as the target string 't'. */

    var min_try_count = -1 ; /* Initialize 'min_try_count' to -1. This variable will store
                                the minimum number of operations found across all possible
                                target characters ('a' through 'z'). */


    // Outer loop: iterates for each possible target character from 'a' to 'z'.
    for ( var i = "a".charCodeAt(0) ; i < "z".charCodeAt(0) + 1 ; i ++ ) {

        // Check if the current string 't' already consists of a single repeating character.
        // If it does, then 0 operations are needed for this character, and we can stop.
        if ( /^([a-z])\1*$/.test(t) ) {
            min_try_count = 0 ; // Set operations count to 0.
            break ; // Exit the outer loop.
        }

        var tmp = t ; /* Create a temporary working copy of the string 't'. */
        var t_prime = "" ; /* Initialize 't_prime', which will hold the string after one operation. */
        var c = String.fromCharCode(i) ; /* Convert the current ASCII value 'i' back to its character.
                                          This 'c' is the character we are trying to make 't' into. */
        var try_count = 0 ; /* Initialize 'try_count' for the current character 'c'.
                               This counts operations for a specific 'c'. */


        while ( true ) { /* Inner loop: continues until 'tmp' (or 't_prime') is reduced to a single repeating character. */

            /*
             * This inner 'for' loop performs one "operation" on the string.
             * It iterates through 'tmp' from index 0 to 'tmp.length - 2'.
             * For each position 'j', it checks 'tmp[j]' and 'tmp[j+1]'.
             * If either matches the target character 'c', 'c' is appended to 't_prime'.
             * Otherwise, 'tmp[j]' is appended to 't_prime'.
             */
            for ( var j = 0 ; j < tmp.length - 1 ; j ++ ) {
                if ( c === tmp.charAt(j) ) {
                    t_prime += c ;
                }
                else if ( c === tmp.charAt(j + 1) ) {
                    t_prime += c ;
                }
                else {
                    t_prime += tmp.charAt(j) ;
                }
            }

            try_count ++ ; /* Increment the operation counter for the current character 'c'. */

            // console.log(t_prime); /* This line was commented out in the original code, retaining its commented status. */

            // After one operation, check if 't_prime' now consists of a single repeating character.
            if ( /^([a-z])\1*$/.test(t_prime) ) {
                break ; // If so, we've achieved the goal for character 'c', exit the inner while loop.
            }

            tmp = t_prime ; /* The new 't_prime' becomes the 'tmp' for the next operation. */
            t_prime = "" ; /* Reset 't_prime' for the next iteration. */

        } /* End of the 'while(true)' loop */


        // After determining 'try_count' for the current character 'c',
        // compare it with the global minimum 'min_try_count'.
        if ( min_try_count == -1 || min_try_count > try_count ) {
            min_try_count = try_count ; // Update if a new minimum is found.
        }

    } /* End of the outer 'for' loop */

    console.log ( min_try_count ) ; /* Output the final minimum number of operations. */

} /* End of the Main function definition */


/*
 * DO NOT EDIT BELOW THIS LINE.
 * This section handles standard input/output operations,
 * reading the entire input at once and calling the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;