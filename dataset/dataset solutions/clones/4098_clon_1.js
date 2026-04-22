/*
 * This is a Type I clone example.
 * It demonstrates how whitespace and comments can be altered
 * without changing the core logic or structure of the code.
 *
 * Original function: Main
 * Purpose: Modifies a string by changing its 4th character to '8'
 *          and then prints the result to the console.
 */
function     Main  (   input   )
{
    // Declare a variable 's' and initialize it by splitting the input string
    var s = input . split  (  ''  )  ;

    // Modify the character at index 3 (which is the 4th character)
    // This line changes the character to '8'
    s   [   3   ]    =    "8"    ;

    // Join the array 's' back into a string and print it to the console
    console  .  log  (  s  .  join  (  ''  )  )  ;
}

// Call the Main function with input read from standard input.
// This part reads the entire content of /dev/stdin as a UTF-8 string.
Main(  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;