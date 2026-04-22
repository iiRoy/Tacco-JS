/*
 * This file contains the main logic for processing input data
 * and calculating minimum distances between points.
 * It's a self-contained script for a specific problem.
 */
'use strict' // Enforce strict mode for cleaner code and fewer errors.

// Define the main function that takes input as a string.
const   main    =   (   arg )   =>  {
    // Pre-process the input string: trim whitespace and split into lines.
    arg     =   arg .   trim()  .   split(  "\n"    )

    // Extract N and M from the first line of input.
    // The '~~' operator is a fast way to convert to integer (floor).
    const   N   =   ~~( arg [   0   ]   .   split(  " " )   [   0   ]   )   ;
    const   M   =   ~~( arg [   0   ]   .   split(  " " )   [   1   ]   )   ;

    // Slice the array to get the 'arr' and 'points' data.
    // 'arr' contains N lines following the first line.
    let     arr     =   arg .   slice(  1   ,   N   +   1   )   ;
    // 'points' contains M lines following 'arr'.
    let     points  =   arg .   slice(  N   +   1   ,   M   +   N   +   1   )   ;


    // Helper function to parse a string representation of a point into an object.
    const   parse   =   v   =>  {
        // Split the string by space and convert parts to integers.
        let     temp    =   v   .   split(  " " )   .   map(    vv  =>  parseInt(   vv  )   )
        // Return an object with x and y coordinates.
        return  {
            x   :   temp    [   0   ]   ,
            y   :   temp    [   1   ]
        }
    }
    
    // Apply the parse function to transform string arrays into object arrays.
    arr     =   arr .   map(    parse   )   ;
    points  =   points  .   map(    parse   )   ;


    // Initialize an array to store the indices of the closest points.
    let     indexArr    =   [   ]   ;

    // Iterate over each element in 'arr' to find its closest point in 'points'.
    arr .   forEach(    (   v   ,   i   )   =>  {
        // Initialize minimum distance to a very large number and index to 0.
        let     minDist     =   1000000000  ;
        let     index       =   0           ;
        
        // Iterate over each element in 'points' to compare distances.
        points  .   forEach(    (   w   ,   j   )   =>  {
            // Calculate Manhattan distance (L1 distance).
            let     dist    =   Math    .   abs(    v   .   x   -   w   .   x   )   +   Math    .   abs(    v   .   y   -   w   .   y   )   ;

            // If the current distance is smaller than the minimum found so far, update.
            if  (   dist    <   minDist )   {
                minDist     =   dist    ;
                index       =   j       ;   // Store the index of the closest point.
            }
        }   )
        
        // After checking all points, push the index of the closest one to indexArr.
        indexArr    .   push(   index   )   ;
    }   )

    // Output the results: print each stored index incremented by 1 (for 1-based indexing).
    indexArr    .   forEach(    v   =>  console .   log(    v   +   1   )   )   ;
}

// Call the main function with input read from stdin.
// This is typical for competitive programming environments.
main(   require(   'fs'    )   .   readFileSync(   '/dev/stdin'    ,   'utf-8' )   )

/*
 * End of script.
 * All necessary operations have been performed.
 */