/*
 * This file contains JavaScript code that processes input
 * to generate a sequence of movement commands.
 * It operates in strict mode to catch common coding errors.
 */
"use strict" ;

// The main function that encapsulates the core logic.
const   main    =   (   arg   )   =>
{
    // First, preprocess the input argument:
    // 1. Trim any leading or trailing whitespace.
    // 2. Split the string into an array of lines based on newline characters.
    arg     =   arg . trim ( ) . split ( "\n" ) ;

    // Extract numerical coordinates from the first line of the input.
    // These represent starting and target positions.

    // Starting X coordinate.
    const   SX  =   parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;

    // Starting Y coordinate.
    const   SY  =   parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Target X coordinate.
    const   TX  =   parseInt ( arg [ 0 ] . split ( " " ) [ 2 ] ) ;

    // Target Y coordinate.
    const   TY  =   parseInt ( arg [ 0 ] . split ( " " ) [ 3 ] ) ;


    // Initialize an empty array to accumulate the sequence of movement instructions.
    let     answer  =   [ ] ;


    // --- GENERATE PATH SEGMENT 1: Move Right ---
    // Iterate TX times to add 'R' (Right) movements.
    for     (   let     i   =   0 ;   i   <   TX ;   i ++   )
    {
        answer . push ( "R" ) ;
    }


    // --- GENERATE PATH SEGMENT 2: Move Up ---
    // Iterate TY times to add 'U' (Up) movements.
    for     (   let     i   =   0 ;   i   <   TY ;   i ++   )
    {
        answer . push ( "U" ) ;
    }


    // --- GENERATE PATH SEGMENT 3: Move Left ---
    // Iterate TX times to add 'L' (Left) movements.
    for     (   let     i   =   0 ;   i   <   TX ;   i ++   )
    {
        answer . push ( "L" ) ;
    }


    // --- GENERATE PATH SEGMENT 4: Move Down ---
    // Iterate TY times to add 'D' (Down) movements.
    for     (   let     i   =   0 ;   i   <   TY ;   i ++   )
    {
        answer . push ( "D" ) ;
    }


    // --- GENERATE PATH SEGMENT 5: Single Left Movement ---
    // Add one 'L' (Left) movement.
    answer . push ( "L" ) ;


    // --- GENERATE PATH SEGMENT 6: Move Up (TY+1 times) ---
    // Iterate TY + 1 times to add 'U' (Up) movements.
    for     (   let     i   =   0 ;   i   <   TY   +   1 ;   i ++   )
    {
        answer . push ( "U" ) ;
    }


    // --- GENERATE PATH SEGMENT 7: Move Right (TX+1 times) ---
    // Iterate TX + 1 times to add 'R' (Right) movements.
    for     (   let     i   =   0 ;   i   <   TX   +   1 ;   i ++   )
    {
        answer . push ( "R" ) ;
    }


    // --- GENERATE PATH SEGMENT 8: Single Down Movement ---
    // Add one 'D' (Down) movement.
    answer . push ( "D" ) ;


    // --- GENERATE PATH SEGMENT 9: Move Down (TY+1 times) ---
    // Iterate TY + 1 times to add 'D' (Down) movements.
    for     (   let     i   =   0 ;   i   <   TY   +   1 ;   i ++   )
    {
        answer . push ( "D" ) ;
    }


    // --- GENERATE PATH SEGMENT 10: Move Left (TX+1 times) ---
    // Iterate TX + 1 times to add 'L' (Left) movements.
    for     (   let     i   =   0 ;   i   <   TX   +   1 ;   i ++   )
    {
        answer . push ( "L" ) ;
    }


    // --- GENERATE PATH SEGMENT 11: Single Up Movement ---
    // Add one 'U' (Up) movement.
    answer . push ( "U" ) ;


    // Finally, join all the movement characters into a single string
    // and print it to the console.
    console . log ( answer . join ( "" ) ) ;

} // End of the main function.


// Read the entire content of standard input as a UTF-8 string,
// then pass it to the main function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;