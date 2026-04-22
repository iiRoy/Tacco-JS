/*
 * This JavaScript file contains a function designed to process input.
 * It demonstrates a simple conditional check based on two numeric values.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

function     Main (   arg   )    {
    // The first numeric value is extracted from the first line of the input.
    // It's parsed as an integer and stored in the 'price' constant.
    const price    =    parseInt  (  arg . split ( "\n" )  [ 0 ]   )   ;

    /*
     * The second numeric value, 'dama1', is extracted from the second line.
     * Like 'price', it's also parsed into an integer.
     */
    const dama1    =    parseInt  (  arg . split ( "\n" )  [ 1 ]   )   ;


    // A conditional check is performed:
    // Is the remainder of 'price' divided by 500 less than or equal to 'dama1'?
    // The result ("YES" or "NO") is then printed to the console.
    console . log (    price   %   500   <=   dama1   ?   "YES"   :   "NO"    )   ;

} /*    End of the Main function declaration    */

// The Main function is invoked here.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
// The input is read synchronously and decoded as UTF-8.
Main(   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;