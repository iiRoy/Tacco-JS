/*
 * This is a JavaScript function designed to calculate the maximum
 * of three possible arithmetic operations between two input numbers.
 * The operations considered are addition, subtraction, and multiplication.
 */
function   main(  input   )   {

    // Split the input string by space to get individual arguments.
    const   args    =   input.split(   ' '   )  ;

    /*
     * Parse the first argument as an integer with base 10.
     * This will be our first operand, 'a'.
     */
    const   a   =   parseInt(   args[0]   ,   10   )   ;

    // Parse the second argument as an integer with base 10.
    // This will be our second operand, 'b'.
    const   b   =   parseInt(   args[1]   ,   10   )   ;


    // Initialize 'max' with the sum of 'a' and 'b'.
    var   max   =   a   +   b   ;

    // Check if 'a - b' is greater than the current 'max'.
    // If it is, update 'max'.
    if   (  max   <   a   -   b  )
    {
        max   =   a   -   b   ; // Update max to the difference
    }

    // Check if 'a * b' is greater than the current 'max'.
    // If it is, update 'max'.
    if   (  max   <   a   *   b  )
    {
        max   =   a   *   b   ; /* Update max to the product */
    }

    // Output the final calculated maximum value to the console.
    console.log(   max   )   ;

}   // End of main function definition


/*
 * This section handles the execution of the main function.
 * It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
 * The input is read as UTF-8 encoded text.
 */
main   (   require('fs').readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;