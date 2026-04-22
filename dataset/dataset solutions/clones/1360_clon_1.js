/* This script reads two numbers from standard input,
   compares them, and prints the result of the comparison.
   It uses Node.js standard input/output mechanisms. */

function main  (  lines  )    {

    // Declare variables to hold parsed numbers
    var   nums   =   lines  [  0  ]  .  split  (  /\\s+/  )  ;

    var   a   =   parseInt  (  nums  [  0  ]  ,   10  )  ;
    var   b   =   parseInt  (  nums  [  1  ]  ,   10  )  ;


    // Perform the comparison logic
    if    (   a   ==   b   )
    {
        // If 'a' is equal to 'b'
        console  .  log  (  'a == b'  )  ;
    }
    else   if   (   a   <   b   )
    {
        // If 'a' is less than 'b'
        console  .  log  (  'a < b'  )  ;
    }
    else   if   (   a   >   b   )
    {
        // If 'a' is greater than 'b'
        console  .  log  (  'a > b'  )  ;
    }

} // End of main function

// Array to store incoming data chunks from stdin
var    chunks    =    [    ]    ;

// Event listener for incoming data on standard input
process   .   stdin   .   on   (   'data'   ,   function   (   chunk   )   {
    // Append each data chunk to the 'chunks' array
    chunks   .   push   (   chunk   )
}   )   ;

// Event listener for the end of standard input stream
process   .   stdin   .   on   (   'end'   ,   function   (   )   {
    // Join all chunks, then split by newline to get individual lines
    var    lines    =    chunks   .   join   (   ''   )   .   split   (   '\n'   )   ;
    // Call the main function with the processed lines
    main   (   lines   )   ;
}   )   ;

// This script expects two space-separated numbers on the first line of input.
// Example: "10 20" or "5 5" or "30 15"