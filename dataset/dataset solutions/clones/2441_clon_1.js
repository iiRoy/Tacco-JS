/*
 * This JavaScript file defines a function to process a numerical input.
 * It determines whether the input is even or odd and performs a specific
 * calculation based on that determination.
 */

function    Main    (    input    )
{

    // The core logic starts here.
    // We check if the remainder of input divided by 2 is 0.
    if  (  input  %  2  ==  0  )
    {
        // If the input is an even number, perform this operation:
        // Divide the input by 2, then subtract 1 from the result.
        console.log  (  (  input  /  2  )  -  1  )  ;
    }
    else
    {
        // If the input is an odd number, perform this alternative operation:
        // Divide the input by 2, then subtract 0.5 from the result.
        console.log  (  (  input  /  2  )  -  0.5  )  ;
    }

} // End of the Main function definition.

// This statement calls the Main function with input read from standard input.
// It uses the Node.js 'fs' module to synchronously read the entire file.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;