/*
 * This is an example JavaScript program.
 * It defines a function to calculate the cube of a number
 * and then calls it with input read from stdin.
 */

function   Main  (  x  )
{
    // Calculate the cube of the input 'x'
    console.log  (  x  *  x  *  x  )  ;
}


// Call the Main function with input from standard input
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;