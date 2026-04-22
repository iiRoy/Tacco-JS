/*
 * This function processes the input to calculate a specific value.
 * It determines the number of steps required to reduce H to 1 by repeatedly halving it,
 * then computes 2 raised to the power of that number of steps, minus 1.
 */
function     Main (   input    )
{

    // Convert the input string to a number and assign it to H.
    var   H   =   Number (   input   )   ;


    /*
     * If H is initially 1, the calculation is trivial,
     * so we directly output 1 and exit the function.
     */
    if  ( H  ===  1 )   return   console . log ( 1 )   ;

    // Initialize a counter to track the number of halving operations.
    var   counter   =   1   ;

    // Enter an infinite loop to perform the halving operations.
    while   (   true   )
    {
        // Halve H, ensuring it remains an integer by flooring the result.
        H   =   Math . floor (   H   /   2   )   ;
        // Increment the counter for each halving step.
        counter   ++   ;

        // If H has been reduced to 1, we have reached our base case, so break the loop.
        if   (   H   ===   1   )   break   ;
    }

    // Calculate the final answer: 2 to the power of 'counter', minus 1.
    const   answer   =   Math . pow (   2   ,   counter   )   -   1   ;

    // Display the computed answer to the console.
    console . log (   answer   )   ;
}

// Do not modify the code below this line. It handles standard input/output and calls the Main function.
Main(   require (   "fs"   )   .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;