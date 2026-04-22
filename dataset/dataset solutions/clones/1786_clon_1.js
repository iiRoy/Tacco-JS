/*
 * This is a simple JavaScript program.
 * It defines a function named Main.
 */

function Main (  input  )
{
    // The Main function takes one argument, 'input'.

    // This line logs the first 3 characters of the input string to the console.
    console . log (  input . substring (  0  ,  3  )  ) ;
} // End of Main function definition.


/*
 * The following code is responsible for reading input from standard input
 * and then calling the 'Main' function with that input.
 * Please DO NOT modify the lines below this comment block,
 * as they handle the standard input/output mechanism for this environment.
 * It reads the entire content from /dev/stdin as UTF-8.
 */


Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;
// The program execution starts here by invoking the Main function.