/*
 * This is a Type I clone of an existing JavaScript function.
 * It processes input data to calculate a maximum sum based on certain conditions.
 * The original logic and structure are preserved exactly.
 * All identifiers, operators, and expressions remain unchanged.
 */
function   Main   ( input   )
{
    // Split the input string by newline characters to get individual lines.
    input  =  input.split ( "\n" ) ;


    // Loop indefinitely until a specific break condition is met.
    for  ( var  i = 0 ; 1 ; i ++ )
    {

        // For each line, split it by spaces to get individual values.
        input [ i ]  =  input [ i ] . split ( " " ) ;


        // Parse the three values from the current line into integers with base 10.
        var   x   =   parseInt ( input [ i ] [ 0 ] , 10 ) ;
        var   y   =   parseInt ( input [ i ] [ 1 ] , 10 ) ;
        var   s   =   parseInt ( input [ i ] [ 2 ] , 10 ) ;


        // Check for the termination condition: if all three values are zero.
        if  ( x  ==  0  &&  y  ==  0  &&  s  ==  0 )
            {  break ;  } // Exit the main loop if the condition is met.


        // Initialize 'max' variable to store the maximum sum found so far for the current input set.
        var   max   =   0 ;


        // Inner loop: iterate 'l' from 1 up to 's' (exclusive).
        for  ( var   l   =   1 ;   l   <   s ;   l ++ )
        {
            // Create an array 'a' and populate it with 'l' and 's - l'.
            var   a   =   [ ] ;
            a [ 0 ]  =  l ;
            a [ 1 ]  =  s   -   l ;


            // Initialize 'sum' and 'flag' for the current iteration of the inner loop.
            var   sum   =   0 ;
            var   flag   =   false ;


            // Loop twice (for a[0] and a[1]) to process each part.
            for  ( var   j   =   0 ;   j   <   2 ;   j ++ )
            {
                // Calculate 'b' based on 'a[j]' and 'x' with a specific formula.
                var   b   =   Math.floor ( a [ j ]   /   ( 100   +   x )   *   100 )   +   1 ;

                // Adjust 'b' downwards in a while loop if a certain condition holds.
                while  ( b   *   ( 100   +   x )   /   100   >=   a [ j ]   +   1 )
                    {   b -- ;   } // Decrement 'b' until the condition is false.

                // Set 'flag' to true if 'b' condition is not met after adjustment.
                if  ( b   *   ( 100   +   x )   /   100   <   a [ j ] )
                    {   flag   =   true ;   } // Indicate an invalid state for this 'a[j]'.

                // Calculate 'c' based on 'b' and 'y' using another formula.
                var   c   =   Math.floor ( b   *   ( 100   +   y )   /   100 ) ;

                // Adjust 'c' upwards if a specific equality holds.
                if  ( c   +   1   ==   b   *   ( 100   +   y )   /   100 )
                    {   c ++ ;   } // Increment 'c'.

                // Add the calculated 'c' to the running sum.
                sum   +=   c ;
            }


            // If the flag was set during the 'j' loop, skip to the next iteration of the 'l' loop.
            if  ( flag )
                {   continue ;   }


            // Update 'max' if the current 'sum' is greater than the previously found maximum.
            if  ( max   <   sum )
            {
                max   =   sum ;
            }
        }


        // Output the maximum sum found for the current set of x, y, s to the console.
        console.log ( max ) ;
    }
}

// Call the Main function with input read from standard input using Node.js 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;