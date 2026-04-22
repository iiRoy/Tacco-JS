/*
 * This file contains the main logic for calculating equivalent resistance.
 * It reads two resistance values from standard input and computes their
 * parallel equivalent.
 */

// Define the primary function that handles the input and performs calculations.
function Main ( input )
{

    // Split the input string by spaces to get individual resistance values.
    var data = input . split ( " " ) ;


    // Parse the first resistance value from the data array.
    var r1 = parseFloat ( data [ 0 ] ) ;


    // Parse the second resistance value from the data array.
    var r2 = parseFloat ( data [ 1 ] ) ;


    // Calculate the equivalent resistance (r3) for two resistors in parallel.
    // The formula is 1 / ( (1 / r1) + (1 / r2) ).
    var r3 = 1  /  (  1  /  r1  +  1  /  r2  ) ;


    // Output the calculated equivalent resistance to the console.
    console . log ( r3 ) ;

} // End of Main function.


// This section handles the execution of the Main function.
// It reads input from standard input using Node.js's 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;