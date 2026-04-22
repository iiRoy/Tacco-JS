function     main   (  input  )

{
    // The initial input string is split into an array of lines.
    // Each line then becomes an element in the 'input' array.
    input  =  input  .  split  (  "\n"  )  ;


    // The first line of the input (input[0]) is further split
    // by spaces to extract individual values.
    // These values are stored in the 'tmp' variable.
    tmp   =   input  [  0  ]  .  split  (  " "  )  ;

    // The second line of the input (input[1]) is also split
    // by spaces, and its components are stored in 'moke'.
    // This handles the processing for the second data line.
    moke   =   input  [  1  ]  .  split  (  " "  )  ;


    // Initialize a counter variable to zero.
    // This counter will be incremented based on a specific condition.
    count   =   0   ;
    /*
     * Begin a loop that iterates a number of times.
     * The loop's upper bound is determined by the first element
     * of the 'tmp' array (tmp[0]).
     */
    for    (    i    =    0    ;    i    <    tmp  [  0  ]    ;    i++    )
    {
        // Inside the loop, check a condition:
        // If the i-th element of 'tmp' is less than or equal to
        // the second element of 'tmp' (tmp[1]).
        if     (     tmp  [  i  ]     <=     tmp  [  1  ]     )
        {
            // If the condition is met, increment the 'count' variable.
            count++   ;
        }
    }
    // After the loop completes, output the final value of 'count' to the console.
    console  .  log  (  count  )  ;
}


/*
 * DO NOT EDIT THE FOLLOWING LINES.
 * These lines are responsible for reading input from standard input
 * and invoking the 'main' function with the retrieved data.
 * This ensures compatibility with the standard execution environment.
 */
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;