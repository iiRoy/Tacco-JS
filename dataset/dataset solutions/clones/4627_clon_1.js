/*
 * This file processes input data to calculate a minimum value based on two different
 * summation strategies. It demonstrates conditional logic and array manipulation.
 *
 * This code is a Type I clone, meaning its functionality and structure
 * are identical to the original, with variations only in whitespace and comments.
 */

const   input   =   require  (  "fs"  ) .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )

;  (  (   input   )   =>   {
    // Split the input string into an array of lines.
    const   lines   =   input .  split  (  '\n'  )

    // Parse the first line to get the number N.
    const   N   =   lines  [  0  ]   -   0

    // Parse the second line, splitting by space and converting to numbers.
    const   a   =   lines  [  1  ] .  split  (  ' '  ) .  map  (  Number  )


    let   ans1   =   0 // Initialize the first answer variable.
    let   sum   =   0 // Initialize the running sum for the first strategy.

    /*
     * First strategy loop: Iterates through the array 'a'
     * to calculate 'ans1' based on specific conditions.
     */
    for   (   let   i   =   0  ;   i   <   N  ;   i  ++   )   {

        // Determine if the current index 'i' is odd or even.
        const   odd   =   i   %   2

        // Condition 1: If 'i' is even (not odd) and sum + a[i] is positive.
        if   (   ! odd   &   sum   +   a  [  i  ]   >   0   )   {
            sum   +=   a  [  i  ]
        }
        // Condition 2: If 'i' is odd and sum + a[i] is negative.
        else   if   (   odd   &   sum   +   a  [  i  ]   <   0   )   {
            sum   +=   a  [  i  ]
        }
        // Default case: Adjust sum and ans1 if conditions 1 and 2 are not met.
        else   {
            ans1   +=   Math .  abs  (  sum   +   a  [  i  ]   -   (  odd   ?   -1   :   1  )  )
            sum   =   odd   ?   -1   :   1
        }

    } // End of first for loop.


    let   ans2   =   0 // Initialize the second answer variable.
    sum   =   0 // Reset the running sum for the second strategy.

    /*
     * Second strategy loop: Iterates through the array 'a' again,
     * but with a slightly different 'odd' calculation.
     */
    for   (   let   i   =   0  ;   i   <   N  ;   i  ++   )   {

        // Determine if (i + 1) is odd or even. This changes the 'odd' logic.
        const   odd   =   (  i   +   1  )   %   2

        // Similar conditional logic as the first loop.
        if   (   ! odd   &   sum   +   a  [  i  ]   >   0   )   {
            sum   +=   a  [  i  ]
        }
        else   if   (   odd   &   sum   +   a  [  i  ]   <   0   )   {
            sum   +=   a  [  i  ]
        }
        else   {
            ans2   +=   Math .  abs  (  sum   +   a  [  i  ]   -   (  odd   ?   -1   :   1  )  )
            sum   =   odd   ?   -1   :   1
        }
    } // End of second for loop.


    // Output the minimum of the two calculated answers.
    console .  log  (  Math .  min  (  ans1  ,   ans2  )  )

}  )  (  input  ) // Immediately Invoked Function Expression (IIFE) closure.