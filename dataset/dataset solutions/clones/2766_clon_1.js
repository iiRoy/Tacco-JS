/*
 * This JavaScript function serves as the entry point for processing a specific input.
 * It's designed to solve a problem involving number manipulation and finding a minimum remainder.
 *
 * This code was generated as a Type I clone, focusing on extensive whitespace and comment variations.
 * All functional aspects, identifiers, and expressions remain strictly identical to the original.
 */
function     Main  (   input   )
{

    // The initial 'input' is typically a single string containing multiple lines.
    // We split this string by newline characters to get an array of lines.
    input   =   input . split ( "\n" ) ;


    // The first line of the input array is expected to contain two space-separated numbers.
    // We split this first line by spaces to get an array of string representations of these numbers.
    inputStr   =   input [ 0 ] . split ( " " ) ;


    // Parse the first string in 'inputStr' into an integer and assign it to variable 'L'.
    var    L    =    Number . parseInt ( inputStr [ 0 ] ) ;


    // Parse the second string in 'inputStr' into an integer and assign it to variable 'R'.
    var    R    =    Number . parseInt ( inputStr [ 1 ] ) ;


    // An array 'arr' is declared here, but it is not utilized in the subsequent logic.
    // It might be a remnant from previous iterations or a placeholder.
    var   arr   =   [ ] ;


    // Initialize 'min' with the value of 'L'. This variable will store the smallest remainder found.
    var   min   =   L   ;


    // Begin the primary conditional check based on the product of L and R.
    if  ( L   *   R   >   2019 )
    {

        // If the first condition is met, proceed to a secondary condition involving the range R - L.
        if  ( R   -   L   <   2019 )
        {
            /*
             * This block executes when the range (R - L) is sufficiently small,
             * meaning we might need to iterate to find the minimum remainder.
             * We use nested loops to check all possible pairs (i1, i2) within the given range.
             */
            for ( var   i1   =   L ;   i1   <   R ;   i1 ++ )
            {

                // The inner loop iterates from 'i1 + 1' up to 'R' (inclusive).
                for ( var   i2   =   i1 + 1   ;   i2   <   R + 1 ;   i2 ++ )
                {

                    // Calculate the product of i1 and i2, then find its remainder when divided by 2019.
                    var   tmp   =   ( i1   *   i2 )   %   2019 ;


                    // If the remainder 'tmp' is exactly 0, this is the smallest possible remainder.
                    // We can immediately set 'min' to 0 and exit the inner loop.
                    if ( tmp   ===   0 )
                    {
                        min   =   tmp ;
                        break ;
                    }
                    else
                    {
                        // If 'tmp' is not 0, compare it with the current 'min' and update 'min' if 'tmp' is smaller.
                        min   =   tmp   <   min   ?   tmp   :   min ;
                    }
                }
            }

            // After completing all iterations or finding a 0 remainder, print the final minimum value.
            console . log ( min ) ;
        }
        else
        {
            // If the range (R - L) is NOT less than 2019 (i.e., R - L >= 2019),
            // it implies that within such a wide range, there must be at least one pair (i1, i2)
            // whose product is a multiple of 2019, thus resulting in a remainder of 0.
            // Therefore, the minimum possible remainder in this case is 0.
            console . log ( 0 ) ;
        }
    }
    else
    {
        /*
         * This 'else' branch is executed if the initial condition (L * R > 2019) is false.
         * The original comment states that no calculation is needed in this scenario.
         * It seems to be an optimized or specific case where the answer is simply L * (L+1) % 2019.
         * The problem context suggests that if L*R is small enough, then L*(L+1)
         * will yield the desired result directly, without requiring complex loops.
         */
        //LとRの積が2019を超えないなら計算する必要がない
        console . log ( L   *   ( L + 1 ) ) ;
    }
}


// This line is responsible for executing the 'Main' function.
// It uses Node.js's 'fs' module to synchronously read the content of '/dev/stdin' (standard input).
// The input is read as a UTF-8 encoded string and then passed to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;