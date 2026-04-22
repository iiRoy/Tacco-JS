/*
 This is a Type I clone of the original JavaScript code.
 It maintains exact semantic and structural identity,
 varying only in whitespace and comments as per the definition.
*/
'use strict'   ; // Ensure strict mode is enabled for the entire script.


// Function to check if all elements in an array are zero.
function   isZero  (   arr   ) {
    /*
     Iterate through each element provided in the array 'arr'.
     If any element is found to be non-zero, the function immediately
     returns false, indicating the array is not all zeros.
    */
    for ( let   elem   of   arr   )
    {
        if  (   elem   !==   0   )
        {
            // Found a non-zero element.
            return   false   ;
        }
    }

    // If the loop completes, all elements were zero.
    return   true   ;
}



// The main function that processes the input and calculates the result.
function   main  (   input   )
{
    // Split the input string by newlines and convert to an array.
    const   tmp   =   Array . from  (   input . split  (  '\n'  )   )   ;


    // Parse the first line as an integer N.
    const   N   =   parseInt  (   tmp[0]   ,   10   )   ;


    // Parse the second line, split by spaces, and convert elements to integers.
    const   h   =   tmp[1] . split  (  ' '  ) . map  (  (   elem   )   =>   parseInt  (   elem   ,   10   )   )   ;


    // Initialize a counter for the number of operations.
    let   count   =   0   ;

    // Continue processing until all elements in 'h' are zero.
    while   (   !   isZero  (   h   )   )
    {
        // Find the maximum value currently present in the array 'h'.
        const   maxVal   =   h . reduce  (  (   max   ,   elem   )   =>   Math . max  (   max   ,   elem   )   )   ;


        // Find the starting index of the first occurrence of the maximum value.
        const   maxValStartInd   =   h . indexOf  (   maxVal   )   ;

        // Initialize the end index of the maximum value's contiguous block.
        let   maxValEndInd   =   maxValStartInd   ;


        // Extend the end index as long as the next element is also the maximum value.
        while   (   h[maxValEndInd   +   1]   ===   maxVal   )
        {
            maxValEndInd   ++   ;
        }


        // Create an array of indices covering the contiguous block of the maximum value.
        const   maxValRange   =   Array . from  (   new   Array  (   maxValEndInd   -   maxValStartInd   +   1   ) . fill  (   0   ) . map  (  (   elem   ,   i   )   =>   i   +   maxValStartInd   )   )   ;


        // Decrement each element within the identified range by one.
        for   (   let   maxValInd   of   maxValRange   )
        {
            h[maxValInd]   --   ;
        }

        // Increment the operation counter.
        count   ++   ;
    }

    // Output the final count to the console.
    console . log  (   count   )   ;
}

// Execute the main function with input read from standard input.
main  (   require  (  'fs'  ) . readFileSync  (  '/dev/stdin'  ,  'utf8'  )   )   ; // Read input from stdin using Node.js 'fs' module.