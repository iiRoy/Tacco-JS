/*
 * This JavaScript code defines a function 'Main' that processes input.
 * It calculates a sum based on conditions derived from the input array.
 * The script then calls 'Main' with data read from standard input.
 */

function   Main   (   input   )   {

    // Step 1: Process the raw input string.
    // The input is first cleaned by removing any trailing newline characters.
    // Then, it is split into an array of strings based on newline characters.
    var   inputArr   =   input . replace ( / \n+ $ / ,   '' ) . split ( / \n / ) ;

    // Step 2: Initialize a variable to accumulate the sum.
    var   sum   =   0 ;

    // Step 3: Begin a loop.
    // The loop iterates 'stay' times, where 'stay' goes from 0 up to (but not including)
    // the numeric value of the first element in 'inputArr'.
    for   (   stay   =   0   ;   stay   <   inputArr [ 0 ]   ;   stay ++   )   {

        // Step 3a: Check a condition within the loop.
        // This condition compares the current value of 'stay' with the numeric value
        // of the second element in 'inputArr'.
        if   (   stay   <   inputArr [ 1 ]   )   {

            // If the condition is true, add the numeric value of the third element
            // from 'inputArr' to the 'sum'.
            sum   +=   Number (   inputArr [ 2 ]   )   ;

        }   else   {

            // If the condition is false, add the numeric value of the fourth element
            // from 'inputArr' to the 'sum'.
            sum   +=   Number (   inputArr [ 3 ]   )   ;

        }

    }

    // Step 4: Output the final calculated sum to the console.
    console . log (   sum   )   ;

}

// This section executes the 'Main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's built-in 'fs' module (filesystem module).
Main   (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;