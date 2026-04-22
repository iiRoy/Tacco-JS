/*
 * This is a JavaScript program.
 * It defines a function named 'Main' to process input.
 */

function   Main  (  input  )
{
    // Declare a variable 'lines' to store the input split by newline characters.
    var   lines   =   input.split  (  '\n'  )  ;

    // Initialize a sum variable 's' to zero.
    var   s   =   0  ;


    /*
     * Iterate through the first 10 lines of the input.
     * The loop variable 'i' goes from 0 up to (but not including) 10.
     */
    for  (  var   i   =   0  ;   i   <   10  ;   ++i  )
    {
        // Check if the current line is just a newline character.
        if  (  lines  [  i  ]   ==   "\n"  )
        {
            // If it is, break out of the loop.
            break  ;
        }

        // Parse the current line as an integer and add it to the sum 's'.
        s   +=   parseInt  (  lines  [  i  ]  )  ;
    }

    // Output the final sum to the console.
    console.log  (  s  )  ;
}

// Call the 'Main' function with the content read from standard input.
// This part reads the entire content of /dev/stdin as UTF-8.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;
// End of the program.