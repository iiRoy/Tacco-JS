/* This is an extensively modified Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * All identifiers, operators, and expressions remain precisely as they were.
 */

// Define the main function that processes the input
function    Main  (  input  )

{

    // Split the input string into an array of lines
    lines   =   input.split  (  "\n"  )

    // Iterate over each line in the 'lines' array
    for  (  i  in  lines  )
    {
        // For each line, split it by space to get individual numbers as strings
        n   =   lines  [  i  ]  .  split  (  " "  )  ;

        // Convert the first and second parts to numbers and sum them
        sum   =   Number  (  n  [  0  ]  )   +   Number  (  n  [  1  ]  )  ;

        // Convert the sum to a string and print its length to the console
        console  .  log  (  sum  .  toString  (  )  .  length  )  ;
    }

}
// Call the Main function with content read from standard input
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;
/* End of Type I clone. */