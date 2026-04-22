/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly as they were.
 * Only whitespace and comments have been altered to create a visually distinct version.
 */

function   Main(   N   )
{
    // The main function, processing input 'N'
    // First, split the input string by spaces
    N   =   N  .  split  (  " "  )   ;   // Splitting the input string.

    // Initialize a boolean flag to true
    var   flag   =   true   ;   // Our primary decision flag.

    /*
     * Check for specific conditions where the flag should be set to false.
     * These conditions involve comparisons of elements within the 'N' array.
     */
    if   (   N  [  0  ]   ==   N  [  1  ]   &&   N  [  1  ]   !=   N  [  2  ]   )
    {
        flag   =   flase   ;   // Note: 'flase' is preserved as per Type I definition.
    }
    else   if   (   N  [  0  ]   ==   N  [  2  ]   &&   N  [  2  ]   !=   N  [  1  ]   )
    {
        flag   =   false   ;   // Set flag to false if this condition is met.
    }
    else   if   (   N  [  1  ]   ==   N  [  2  ]   &&   N  [  1  ]   !=   N  [  0  ]   )
    {
        flag   =   false   ;   // Another condition for setting flag to false.
    }

    // Based on the final value of 'flag', print "No" or "Yes".
    if   (   flag   )
    {
        console  .  log  (  "No"  )   ;   // Output "No" if flag is true.
    }
    else
    {
        console  .  log  (  "Yes"  )   ;   // Output "Yes" if flag is false.
    }

}

// Invoke the Main function with input read from stdin.
Main  (
    require  (  "fs"  )
        .  readFileSync  (
            "/dev/stdin"  ,
            "utf8"
        )
        .  trim  (  )
)   ;
// End of file. This comment marks the conclusion of the script.