/*
 * This JavaScript program processes time-related input.
 * It calculates a specific time duration based on given start and end times,
 * and a subtraction factor.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 */

    // Retrieve input data from standard input asynchronously.
    // The 'fs' module is used for file system operations, specifically reading files.
    // '/dev/stdin' is the standard input stream in Unix-like systems.
    const    input    =    require (  "fs"  ) . readFileSync ( "/dev/stdin"  ,   "utf8"  )

// Initialize an array 'cin' by splitting the input string.
// It splits by spaces or newlines. 'cid' is an index for traversing 'cin'.
let cin = input . split ( / |\n/ )    ,   cid   =   0


    // Define a utility function 'next' to get the next item from 'cin'.
    // It increments 'cid' after accessing the element.
    const   next    =   ( )   =>   cin [ cid ++ ]


// Another utility function 'nexts' to get 'n' items from 'cin'.
// It converts them to integers using parseInt and advances 'cid'.
const   nexts   =   ( n )   =>   cin . slice ( cid  ,  cid += n ) . map ( i => parseInt ( i ) )


    /*
     * Parse the five input values:
     * H1: Start hour
     * M1: Start minute
     * H2: End hour
     * M2: End minute
     * K: Subtraction factor (minutes)
     */
    const   [ H1 ,   M1 ,   H2 ,   M2 ,   K ]   =   nexts ( 5 )  ;



    // Calculate the total time difference in minutes.
    // First, convert H2 and M2 to total minutes from midnight.
    // Then, convert H1 and M1 to total minutes from midnight.
    // Subtract the start time from the end time, then subtract the factor K.
    const   time    =   H2  *  60    +   M2    -   ( H1  *  60   +   M1 )    -   K


    // Output the calculated 'time' if it's greater than 0, otherwise output 0.
    // This uses a ternary operator for concise conditional logging.
    time    >   0   ?   console . log ( time )    :   console . log ( 0 )