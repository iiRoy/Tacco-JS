function  Main  ( input ) /* This is the primary function responsible for processing the input. */ {
    // First, parse the input string to extract parameters H and W.
    const Param  =  input . split ( '\n' ) [ 0 ] . split ( ' ' )

    // H represents the height, parsed as an integer.
    const H  =  i ( Param [ 0 ] )

    /* W represents the width, also parsed as an integer. */
    const W  =  i ( Param [ 1 ] )

    // Special case: if width is 1, it's always a 'Yes' scenario.
    if ( W  ==  1 )
        return  console . log ( 'Yes' )


    /* The following block processes the remaining input to count character occurrences.
     * It skips the first line (parameters H and W), joins all other lines,
     * splits into individual characters, and then counts each character. */
    const Obj  =  input . split ( '\n' ) . slice ( 1 ) . join ( '' ) . split ( '' ) . reduce (
        function ( obj , c ) {
            // If the character 'c' is not yet in the object, initialize its count to 0.
            if ( obj [ c ]  ==  undefined )
                obj [ c ]  =  0

            // Increment the count for the current character 'c'.
            obj [ c ] ++

            // Return the updated object for the next iteration.
            return  obj
        } ,
        // The initial value for the accumulator 'obj' is an empty object.
        {}
    )


    // Case 1: Both H and W are even.
    if ( H  %  2  ==  0  &&  W  %  2  ==  0 ) {

        /* In this case, all character counts must be divisible by 4.
         * 'len' will store the number of characters whose counts are NOT divisible by 4. */
        const len  =  Object . keys ( Obj ) . filter (
            function ( k ) {
                return  Obj [ k ]  %  4  !=  0
            }
        ) . length

        // If 'len' is 0, it means all counts are divisible by 4.
        if ( len  ==  0 ) {
            return  console . log ( 'Yes' )
        } else {
            // Otherwise, at least one count is not divisible by 4.
            return  console . log ( 'No' )
        }
    }


    /* Case 2: Both H and W are odd. */
    if ( H  %  2  !=  0  &&  W  %  2  !=  0 ) {

        /* In this scenario, we need to count the sum of character counts that are not multiples of 4.
         * This 'sum' represents the total number of 'odd' cells after accounting for blocks of 4. */
        const sum  =  Object . keys ( Obj ) . filter (
            function ( k ) {
                // Keep only keys where the count is not a multiple of 4.
                return  Obj [ k ]  %  4  !=  0
            }
        ) . reduce (
            function ( sum , key ) {
                // Add the count of the character to the running sum.
                return  sum  +  i ( Obj [ key ] )
            } ,
            // Initial sum is 0.
            0
        )

        // If the 'sum' of these remaining characters is odd, it's a 'Yes'.
        if ( sum  %  2  ==  1 ) {
            return  console . log ( 'Yes' )
        } else {
            // Otherwise, if the sum is even, it's a 'No'.
            return  console . log ( 'No' )
        }
    }


    /* Case 3: One of H or W is odd, and the other is even (but not W=1, handled earlier).
     * In this case, there must be no characters whose count is not divisible by 4.
     * The variable 's' calculates the sum of counts not divisible by 4. */
    const s  =  Object . keys ( Obj ) . filter (
        function ( k ) {
            return  Obj [ k ]  %  4  !=  0
        }
    ) . reduce (
        function ( sum , k ) {
            // Sum up the counts of characters that are not multiples of 4.
            return  sum  +  i ( Obj [ k ] )
        } ,
        0
    )

    // If 's' is 0, it means all character counts were divisible by 4.
    if ( s  ==  0 ) {
        return  console . log ( 'Yes' )
    } else {
        // If 's' is not 0, it means there's at least one count not divisible by 4.
        return  console . log ( 'No' )
    }
}

// Helper function to parse a string to an integer with base 10.
function  i ( x ) {
    return  parseInt ( x ,  10 )
}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;