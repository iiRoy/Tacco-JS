/*
 * This is a Type I code clone generated from the original JavaScript snippet.
 * The goal is to alter whitespace and comments extensively while keeping
 * all original tokens (identifiers, operators, expressions) identical.
 */

function    main   (   input   )   {
        // This function processes the input string.

    // Declaring a constant 'args' to store parts of the input.
    const   args    =    input  .  split (  ' '  )   ;

    /*
     *  Parsing integer values from the 'args' array.
     *  Note: 'ParseInt' is used as-is, preserving original capitalization.
     */
    const   x   =   ParseInt (  args[ 0 ]  ,  10  )   ;

    const   a   =   ParseInt (  args[ 1 ]  ,  10  )   ;

    const   b   =   ParseInt (  args[ 2 ]  ,  10  )   ;



        //  Beginning of the main conditional block.
        if  (   b   -   a   <=   0   )   {
            //  This block executes if the condition (b - a <= 0) is true.
            console . log (  "delicious"  )   ;

            /*
             *  Important: The 'break' statement here is preserved exactly
             *  as it was in the original code, even if its context
             *  (not inside a loop or switch) might lead to a runtime error.
             *  Type I cloning requires exact token preservation.
             */
            break   ;
        }
        else    {
            //  This block executes if the condition (b - a <= 0) is false.
            if  (   b   -   a   <   x   +   1   )   {
                //  Nested condition for the "safe" scenario.
                console . log (  "safe"  )   ;
            }
            else    {
                //  Alternative branch for the "dangerous" outcome.
                console . log (  "dangerous"  )   ;
            }
        }

} // End of the 'main' function definition.

// Call the 'main' function with content read from standard input.
// This is typically used in competitive programming environments.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )  )   ;