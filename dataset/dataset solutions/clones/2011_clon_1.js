/*
 * This is a Type I clone generated from an original JavaScript code snippet.
 * All functional logic, variable names, and expressions remain identical.
 * Only whitespace and comments have been altered significantly.
 */

function   Main  (  input  )
{
    // Initialize the variable 'k' by parsing the input string into an integer.
    k   =   parseInt (   input   )   ;

    /*
     * Initialize loop counters and control variables.
     * 'i' is the number currently being checked.
     * 'c' counts the valid numbers found so far.
     */
    i = 9   ;


    c = 9   ;


    while  (  c   <   k  )
    {
        // Increment 'i' to check the next number.
        i++ ;


        // Extract the first and second digits of the current number 'i'.
        a = parseInt ( String ( i ) . substr ( 0 , 1 ) ) ;
        b = parseInt ( String ( i ) . substr ( 1 , 1 ) ) ;

        // Check for specific conditions to adjust 'i' for efficiency.
        if  (  a   -   b   <   -1  )
        {
            /*
             * If the first digit is much smaller than the second,
             * jump 'i' to the next number that starts with (first digit + 1).
             * This optimization skips numbers that are guaranteed to fail the condition.
             */
            i = ( parseInt ( String ( i ) . substr ( 0 , 1 ) ) + 1 ) * ( 10 ** ( String ( i ) . length - 1 ) ) ;
        }


        if  (  a   -   b   >   1  )
        {
            // If the first digit is much larger than the second,
            // adjust 'i' to skip invalid numbers.
            // This involves some complex manipulation of digits.

            tmp = parseInt ( String ( i ) . substr ( 0 , 1 ) ) * ( 10 ** ( String ( i ) . length - 1 ) ) ;

            tmp2 = ( parseInt ( String ( tmp ) . substr ( 0 , 1 ) ) - 1 ) * ( 10 ** ( String ( i ) . length - 2 ) ) ;

            tmp3 = parseInt ( String ( i - tmp ) . substr ( 0 , 1 ) ) * ( 10 ** ( String ( i ) . length - 2 ) ) ;

            i = tmp + tmp2 + ( i - tmp - tmp3 ) ;
        }

        // 'p' is a flag to determine if the current number 'i' is valid.
        p = true ;


        // Loop through the digits of 'i' to check the "adjacent digit difference" rule.
        for  (  ii = 0 ; ii < String ( i ) . length - 1 ; ii++  )
        {
            /*
             * Extract adjacent digits.
             * 'a' is the current digit.
             * 'b' is the next digit.
             */
            a = parseInt ( String ( i ) . substr ( ii , 1 ) ) ;
            b = parseInt ( String ( i ) . substr ( ii + 1 , 1 ) ) ;

            // If the absolute difference between adjacent digits is greater than 1,
            // then 'i' is not a valid number.
            if  (  Math . abs ( a - b ) > 1  )
            {
                p = false ; // Mark as invalid.
                break ;     // No need to check further digits.
            }
        }

        // If 'p' is still true, it means 'i' is a valid number.
        if  (  p   ==   true  )
        {
            c++ ; // Increment the count of valid numbers found.
        }
    }

    // After the loop, determine what to log based on 'k'.
    if  (  k   >=   10  )
    {
        // If 'k' is 10 or more, log the final 'i' value.
        console . log ( i ) ;
    }
    else
    {
        // If 'k' is less than 10, log the original 'k' value.
        // This handles single-digit cases directly.
        console . log ( k ) ;
    }
} // End of Main function

/*
 * Call the Main function with input read from standard input.
 * This simulates reading input in a competitive programming environment.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;