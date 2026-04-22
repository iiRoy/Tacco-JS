/*
 * This JavaScript code generates a multiplication table.
 * It iterates through numbers from 1 to 9
 * for both factors and prints their product.
 */
for  (  var   i   =   1;   i   <   10;   i++  )     // Outer loop: controls the first multiplicand
{

    // Start of the inner loop
    for  (  var   j   =   1;   j   <   10;   j++  )     // Inner loop: controls the second multiplicand
    {
        /*
         * Log the current multiplication operation and its result
         * to the standard output (console).
         * Example output: "1x1=1", "1x2=2", etc.
         */
        console.log(   i   +   "x"   +   j   +   "="   +   (   i   *   j   )   )   ;
    }

}    // End of the outer loop, all calculations are complete.