/*
 * This is a JavaScript function named Main.
 * It processes some input data.
 */
function     Main   (  input  )
{
    // Initialize a variable 'n' to 0.
    var   n   =   0


    /*
     * Initialize another variable 'a' to 0.
     * This variable will count certain occurrences based on the input.
     */
    var   a   =   0


    // Loop starting from i=2.
    // The loop continues as long as 'i' is greater than half the input length.
    // Note: This loop condition might make the loop not run at all for longer inputs.
    for  ( var   i   =   2  ;  i   >   input.length   /   2  ;  i++  )
    {
        // Calculate a new value for 'n' based on the current 'i'.
        n   =   i   *   2   +   1 ;

        // Check a specific condition involving elements of the 'input' string/array.
        // It checks if the character at index (n-1) is equal to the character at index (n),
        // OR if the character at index (n+1) is equal to the character at index (n).
        if (  (  input[  n   -   1  ]   ==   input[  n  ]  )   ||   (  input[  n   +   1  ]   ==   input[  n  ]  )  )
        {
            // If the condition is true, increment the counter 'a'.
            a++
        }
    }

    // After the loop finishes, print the final count 'a' to the console.
    console.log (  a  ) ;
}


// Call the Main function with input read from standard input.
// This reads the entire content of /dev/stdin as a UTF-8 encoded string.
Main  (  require (  "fs"  ) .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;