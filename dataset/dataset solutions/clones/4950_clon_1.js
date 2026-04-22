/*
 * This JavaScript code processes a given input string.
 * The 'input' parameter receives all the necessary data for processing.
 */
function   Main (  input   )
{

    // Declare and initialize variables to hold parts of the input string.
    var   first_word   =   input.slice(  0,   4  )   ;
    var   second_word   =   input.slice(  4  )   ;

    /*
     * Output the concatenated result to the console.
     * A space character separates the two parts.
     */
    console.log(  first_word   +   ' '   +   second_word   )   ;

}

// === DO NOT ALTER THE FOLLOWING LINE OF CODE ===
Main  (  require("fs").readFileSync("/dev/stdin", "utf8")  )   ;