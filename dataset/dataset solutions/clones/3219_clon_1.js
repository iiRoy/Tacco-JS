/*
 * This JavaScript program processes input data from standard input.
 * It expects a space-separated string of numbers.
 * The program then calculates the division of the first two numbers.
 */

function   Main  (  input  )
{
    // Remove any leading or trailing whitespace from the raw input string.
    input  =  input  .  trim  (  )

    // Split the cleaned string by spaces and convert each part to a number.
    // The 'input' variable is re-assigned to hold this new array of numbers.
    input  =  input  .  split  (  " "  )  .  map  (  Number  )  ;

    /*
     * Perform the division operation using the first element (index 0)
     * and the second element (index 1) of the processed number array.
     * The result is then outputted to the standard console.
     */
    console  .  log  (  input  [  0  ]  /  input  [  1  ]  )
}

// The 'Main' function is immediately invoked.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's 'fs' module in a synchronous manner.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;