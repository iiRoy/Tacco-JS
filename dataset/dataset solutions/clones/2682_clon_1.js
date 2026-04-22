/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 */

function   Main  ( args )    {

    // Declare a constant for the first line of input.
    const   firstRow   =   args . split ( "\n" ) [ 0 ] ;

    /*
     * Declare another constant for the second line.
     * This line is further split by spaces into an array.
     */
    const   secondRow   =   args . split ( "\n" ) [ 1 ] . split ( " " ) ;

    // console.log("Debug: First row obtained:", firstRow); // Original comment variation
    // console.log("Debug: Second row obtained:", secondRow); /* Another debug line */

    // Commence the first primary iteration over the 'secondRow' array.
    for  ( var   i   =   0 ;   i   <   secondRow . length   -1      ; i++ )
    {
        // Check for a significant decreasing jump (more than -1 difference).
        if  (   secondRow [ i+1 ]   -   secondRow [ i ]   <   -1   )
        {
            // If such a jump is found, it's an invalid sequence.
            return   console . log ( "No" ) ;
        }
        ;

        // Check for a specific case: a decrease of exactly -1.
        if  (   secondRow [ i+1 ]   -   secondRow [ i ]   ===   -1   )
        {
            // If found, modify the current element.
            secondRow [ i ]   =   secondRow [ i ]   -1 ;

            // After modification, check if the previous element is now greater.
            if  (   secondRow [ i-1 ]   >   secondRow [ i ]   )
            {
                // If it is, the sequence is invalid.
                return   console . log ( "No" ) ;
            }
        }
    }

    // Output the potentially modified secondRow array for debugging or intermediate state.
    console . log ( secondRow ) ;

    // Start the second validation loop.
    for  ( var   i   =   0 ;   i   <   secondRow . length   -1      ; i++ )
    {
        // This loop checks for any decreasing order after the first set of adjustments.
        if  (   secondRow [ i+1 ]   <   secondRow [ i ]   )
        {
            // If any element is smaller than its predecessor, the sequence is invalid.
            return   console . log ( "No" ) ;
        }
    }

    // If all checks pass, the sequence is valid.
    console . log ( "Yes" ) ;

}

// The main function call, reading input from standard input.
Main  (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;

/* End of Type I clone. */