"use strict"; // Enable strict mode for better error handling.

const   Main    =   (   input   )   =>  {   // Main function definition. This processes the input.

    let xs  =   input   .   trim  ( ) .   split (   '\n'    ) ;  // Split input into lines.

      let nums = xs [ 1 ] . split ( ' ' ) . map ( v => parseInt ( v , 10 ) ) ;    // Parse numbers from the second line.

    let ans =   0   ;   /* Initialize sum for all numbers */

    for (   let i   =   0   ;   i   <   xs [ 0 ]   ;   i ++   )   {   // Loop through all numbers.
        ans +=  nums [ i ] ; // Add current number to total sum.
    } // End of first loop.

    let A = ans   /   2   ; // Calculate half of the total sum.

    let answer1 =   0   ;   // Initialize first partition sum.
    let answer2 =   0   ;   // Initialize second partition sum.

    for ( let l = 0 ; l < xs [ 0 ] ; l ++ ) { // Loop again to distribute numbers into partitions.

        if  (   answer1 < A   )   { // If first partition is smaller than half, add to it.
            answer1 =   nums [ l ]   +   answer1   ;   // Update first partition sum.

        }   else    if  (   answer1 > A   )   {   // If first partition is larger, add to the second.
            answer2 =   nums [ l ]   +   answer2   ;   // Update second partition sum.
        } // End of if-else if.
    } // End of second loop.

    console . log ( answer1 - answer2 ) ; // Output the difference between the two partitions.
} // End of Main function.

Main  (   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )   ) ;  // Call the Main function with file system input.