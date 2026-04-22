/*
 * This JavaScript file defines a single function 'main'
 * which processes a string input to perform a specific
 * conditional check based on parsed numerical data.
 */

// The main function declaration, accepting one argument.
function   main(  arg  )   {

    // Declare and initialize a constant variable named 'a'.
    // This variable will hold a 2D array of numbers.
    // First, the input 'arg' string is split into lines using
    // a regular expression that handles various newline characters.
    // Then, for each resulting line 'item', it's further split by spaces.
    // Finally, each string part obtained from the space-split is converted
    // into a number using the global 'Number' constructor.
    const   a   =   arg .  split(  /\r\n|\r|\n/  ) .  map(  item   =>   item .  split(  ' '  ) .  map(  Number  )  )  ;


    // Begin a conditional statement block.
    // It checks the value at a specific index [1][1] of the 'a' array.
    // The comparison uses the strict equality operator '===' to ensure
    // both value and type are identical.
    if   (  a  [  1  ]  [  1  ]   ===   1  )   {
        // If the condition evaluates to true, then log the integer 1 to the console.
        console .  log(  1  )  ;
    }   else   {
        // Otherwise (if the condition is false), log the integer 0 to the console.
        console .  log(  0  )  ;
    }   // End of the if-else conditional block.

}   // End of the 'main' function definition.