/*
 * This JavaScript file defines a function 'Main' that processes an input number.
 * It then calls 'Main' with content read from standard input.
 * This is a Type I clone, preserving all identifiers and logic,
 * but altering whitespace and comments extensively.
 */

// Define the primary function named 'Main'
function    Main  (  input  )

{

    // Check if the input falls within the first range (400-599)
    if  (  input  >=  400  &&  input  <=  599  )
    {
        console  .  log  (  '8'  )  ; // Output '8' for this range
    }
    // Otherwise, check the next range (600-799)
    else    if  (  input  >=  600  &&  input  <=  799  )
    {
        console  .  log  (  '7'  )  ; // Output '7' for this range
    }
    // Otherwise, check the next range (800-999)
    else    if  (  input  >=  800  &&  input  <=  999  )
    {
        console  .  log  (  '6'  )  ; // Output '6' for this range
    }
    // Otherwise, check the next range (1000-1199)
    else    if  (  input  >=  1000  &&  input  <=  1199  )
    {
        console  .  log  (  '5'  )  ; // Output '5' for this range
    }
    // Otherwise, check the next range (1200-1399)
    else    if  (  input  >=  1200  &&  input  <=  1399  )
    {
        console  .  log  (  '4'  )  ; // Output '4' for this range
    }
    // Otherwise, check the next range (1400-1599)
    else    if  (  input  >=  1400  &&  input  <=  1599  )
    {
        console  .  log  (  '3'  )  ; // Output '3' for this range
    }
    // Otherwise, check the next range (1600-1799)
    else    if  (  input  >=  1600  &&  input  <=  1799  )
    {
        console  .  log  (  '2'  )  ; // Output '2' for this range
    }
    // Otherwise, check the final range (1800-1999)
    else    if  (  input  >=  1800  &&  input  <=  1999  )
    {
        console  .  log  (  '1'  )  ; // Output '1' for this final range
    }

} // End of the 'Main' function definition


// Call the 'Main' function
// The input is read synchronously from the standard input ('/dev/stdin')
// using Node.js's 'fs' module, and decoded as UTF-8.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;
// End of script execution.