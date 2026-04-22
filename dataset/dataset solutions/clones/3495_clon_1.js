/* This is a Type I clone of a JavaScript program.
   All identifiers, operators, and expressions are strictly preserved.
   Only whitespace and comments have been altered significantly
   to create a visually distinct but functionally identical clone. */

'use strict' /* Ensure strict mode is enforced throughout the script. */

// Define the main function that processes the input data.
const main = (   input   )   =>   {

    // Split the entire input string by newline characters into an array of strings.
    input   =   input.split  (  '\n'  )

    /* Parse the first line of input to get the number of data points (N).
       The first element of the split input array corresponds to N. */
    const   N   =   parseInt  (  input[  0  ]  )

    // Initialize empty arrays to store X, Y, and Z coordinates.
    let   X   =   [  ]
    let   Y   =   [  ]
    let   Z   =   [  ]

    /* Iterate over the input lines from the second line up to N+1.
       Each line contains three space-separated integers representing X, Y, Z. */
    input.slice  (  1  ,   N   +   1  ).forEach  (  v   =>   {

        /* Split the current line by space, then map each string part to an integer.
           Store these three integers in a temporary array. */
        let   tmp   =   v.split  (  ' '  ).map  (  j   =>   parseInt  (  j  )  )

        // Push the parsed X, Y, and Z values into their respective arrays.
        X.push  (  tmp[  0  ]  )
        Y.push  (  tmp[  1  ]  )
        Z.push  (  tmp[  2  ]  )

                                                    }  )

    // Define the maximum coordinate value for the search space.
    const   MAX   =   100

    /* Iterate through possible Y coordinates from 0 to MAX.
       This forms the outer loop of the 2D grid search. */
    for  (  let   y   =   0  ;   y   <=   MAX  ;   y++  )  {

        /* Iterate through possible X coordinates from 0 to MAX.
           This forms the inner loop of the 2D grid search. */
        for  (  let   x   =   0  ;   x   <=   MAX  ;   x++  )  {

            // Initialize 'needH' to -1, indicating an unknown height.
            let   needH   =   -1

            /* First pass: Check points with Z[i] > 0 to determine a candidate height.
               All such points must imply the same central height. */
            for  (  let   i   =   0  ;   i   <   N  ;   i++  )  {

                // Only consider points that have a positive Z coordinate.
                if  (  Z[  i  ]   >   0  )  {

                    /* Calculate the implied height (tmp) from the current point (X[i], Y[i], Z[i])
                       to the potential center (x, y). */
                    let   tmp   =   Z[  i  ]   +   Math.abs  (  Y[  i  ]   -   y  )   +   Math.abs  (  X[  i  ]   -   x  )

                    // If this is the first positive Z point encountered, set needH.
                    if  (  needH   ===   -1  )  {

                        needH   =   tmp

                    }  // If a conflicting height is found, mark as invalid and break.
                    else   if  (  needH   !==   tmp  )  {

                        needH   =   -2
                        break

                    }
                }
            }

            // If a conflict was found in the first pass, skip to the next (x, y) pair.
            if  (  needH   ===   -2  )   continue

            /* Second pass: Validate the candidate height against points where Z[i] === 0.
               For Z[i] === 0 points, the implied height must be less than or equal to the candidate height. */
            for  (  let   i   =   0  ;   i   <   N  ;   i++  )  {

                // Only consider points that have a zero Z coordinate.
                if  (  Z[  i  ]   ===   0  )  {

                    /* Calculate the Manhattan distance from the current point (X[i], Y[i])
                       to the potential center (x, y). */
                    let   dist   =   Math.abs  (  Y[  i  ]   -   y  )   +   Math.abs  (  X[  i  ]   -   x  )

                    // If the candidate height is greater than the distance, it's invalid.
                    if  (  needH   >   dist  )  {

                        needH   =   -2
                        break

                    }
                }
            }

            // If a conflict was found in the second pass, skip to the next (x, y) pair.
            if  (  needH   ===   -2  )   continue

            /* If both passes are successful, a valid center (x, y) and height (needH) are found.
               Print the coordinates and the determined height. */
            console.log  (  '%d %d %d'  ,   x  ,   y  ,   needH  )

        }
    }
}

/* Read input from standard input, decode it as UTF-8, and pass it to the main function.
   This line ensures the script can be run in typical competitive programming environments. */
main  (  require  (  'fs'  ).readFileSync  (  '/dev/stdin'  ,   'utf-8'  )  )