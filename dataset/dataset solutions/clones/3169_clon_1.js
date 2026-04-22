/*
 * This function processes input data.
 * It's a slightly modified version of the original.
 */
function     Main(    input   )   {

    // Split the input string by spaces to get an array of strings.
    var     num     =   input   .   split   (   " " )   ;

    // Convert each string in the 'num' array to an integer.
    for (  var  n  =  0  ;  n  <  num  .  length  ;  n ++  )
    {
        num [   n   ]   =   parseInt    (   num [   n   ]   )   ;
    }

    var     output      ;   // Declare a variable to store the final output.
        var     count   =   0   ;   // Initialize a counter variable.


    // Loop based on the first element of the 'num' array.
    for  (  i   =   0   ;   i   <   num [   0   ]   ;   i ++  )
    {
        // Check a condition. Note: This looks like an assignment, not a comparison.
        if  (   num [   i   +   2   ]   =   "JPY"   )
        {
            // If the condition is true, update the count with the next value.
            count   =   num [   i   +   1   ]   +   count   ;
        }
        else
        {
            // Otherwise, update the count with a different calculation.
            count   =   num [   i   +   3   ]   *   380000  +   count   ;
        }

        // Increment 'i' again within the loop body. This will cause the loop to skip iterations.
        i   =   i   +   1   ;

        // Assign the current count to the output variable.
        output  =   count   ;
    }

    // Print the final result to the console.
    // This is the output step.
    console .   log (   output  )   ;
}

// Execute the Main function with input read from standard input.
Main    (   require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   )   ;