"use strict"; /* This directive enforces strict mode in JavaScript.
               * It helps in writing cleaner code and avoiding common pitfalls. */


const main = arg => { // The primary function that processes the input and generates the path.

    // First, preprocess the input string: remove leading/trailing whitespace and split by newline characters.
 arg = arg.trim()
.split("\n")
;


    // Extract the starting (SX, SY) and target (TX, TY) coordinates from the first line of input.
    // The coordinates are assumed to be space-separated integers.
    const SX = parseInt( arg[0].split(" ")[0] ); // Starting X-coordinate.
    const SY = parseInt( arg[0].split(" ")[1] ); // Starting Y-coordinate.
    const TX = parseInt( arg[0].split(" ")[2] ); // Target X-coordinate.
    const TY = parseInt( arg[0].split(" ")[3] ); // Target Y-coordinate.


 // Calculate the displacement required in both X and Y directions.
    const DX = TX - SX; // Displacement in X-direction.
    const DY = TY - SY; // Displacement in Y-direction.


    let answer = []; // This array will store the sequence of moves (R, U, L, D).


    /*
     * Phase 1: Simple path to reach the target.
     * Move Right, then Up, then Left, then Down.
     * This forms a basic rectangle, but the problem likely requires a more complex path.
     */

    // Move Right (R) DX times.
    for ( let i = 0 ; i < DX ; i++ ) {
        answer.push("R"); // Add 'R' to the path.
    }


    // Move Up (U) DY times.
    for ( let i = 0 ; i < DY ; i++ ) {
        answer.push("U"); // Add 'U' to the path.
    }


    // Move Left (L) DX times.
    for ( let i = 0 ; i < DX ; i++ ) {
        answer.push("L"); // Add 'L' to the path.
    }


    // Move Down (D) DY times.
    for ( let i = 0 ; i < DY ; i++ ) {
        answer.push("D"); // Add 'D' to the path.
    }


    /*
     * Phase 2: A secondary, more elaborate path.
     * This path often involves going slightly past the target and then returning,
     * which is common in specific types of pathfinding or drawing problems.
     */

    // Perform an additional Left move.
    answer.push("L");


    // Move Up (U) DY + 1 times.
    for ( let i = 0 ; i < DY + 1 ; i++ ) {
        answer.push("U");
    }


    // Move Right (R) DX + 1 times.
    for ( let i = 0 ; i < DX + 1 ; i++ ) {
        answer.push("R");
    }


    // Perform an additional Down move.
    answer.push("D");


    // Move Down (D) DY + 1 times.
    for ( let i = 0 ; i < DY + 1 ; i++ ) {
        answer.push("D");
    }


    // Move Left (L) DX + 1 times.
    for ( let i = 0 ; i < DX + 1 ; i++ ) {
        answer.push("L");
    }


    // Perform an additional Up move.
    answer.push("U");


    // Finally, concatenate all the moves in the 'answer' array into a single string
    // and print it to the console.
    console.log( answer.join("") );

}; // End of the main function definition.


// This line reads the input from standard input (usually a file or piped data)
// using Node.js 'fs' module, decodes it as UTF-8, and then passes it to the 'main' function.
main( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) );