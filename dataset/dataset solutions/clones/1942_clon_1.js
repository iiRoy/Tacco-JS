/*
 *  This JavaScript file defines a primary function, 'Main',
 *  which processes a string input, typically from standard input.
 *
 *  The purpose is to parse numerical data, perform specific
 *  mathematical calculations involving ceiling division,
 *  and then output a 'Yes' or 'No' based on a comparison
 *  of two derived values.
 *
 *  No external dependencies beyond Node.js built-in modules
 *  (like 'fs') are required for execution in its typical environment.
 */


const Main = ( input ) => {

    // The input string is first split by spaces.
    // Each resulting string element is then converted into a numerical type.
    // This array, 'sp', will hold the four integer values required for calculations.
    const sp = input . split ( ' ' ) . map ( e => Number ( e ) ) ;


    // Calculate the first primary value, 'a'.
    // This involves dividing the third element (index 2) by the second element (index 1)
    // of the 'sp' array, and then rounding the result up to the nearest whole number.
    const a = Math . ceil ( sp [ 2 ] / sp [ 1 ] ) ;


    // Calculate the second primary value, 'b'.
    // Similar to 'a', but using the first element (index 0) divided by the fourth element (index 3)
    // of the 'sp' array, with the result also rounded up.
    const b = Math . ceil ( sp [ 0 ] / sp [ 3 ] ) ;


    // Two intermediate calculation results, 'resultA' and 'resultB', are computed.
    // Although calculated, these specific variables are not directly used
    // in the final output logic of this particular program version.
    const resultA = sp [ 0 ] - sp [ 3 ] * b ;

    const resultB = sp [ 2 ] - sp [ 1 ] * a ;


    // The program's final action is to print a string to the console.
    // It checks if 'a' is strictly equal to 'b'.
    // If they are equal, it prints 'Yes'; otherwise, it prints 'No'.
    console . log ( a === b ? 'Yes' : 'No' ) ;

} ; // End of the Main function definition.


// --- Program Entry Point ---
// This block ensures the 'Main' function is executed when the script runs.
// It reads data from '/dev/stdin' (standard input stream) using Node.js's
// file system module ('fs'), decodes it as UTF-8, and passes the resulting
// string to the 'Main' function for processing.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


/*
 *  Below are commented-out examples of how the 'Main' function
 *  could be invoked directly with hardcoded string inputs for testing
 *  or debugging purposes, bypassing the standard input mechanism.
 */
// Main ( `10 9 10 10` ) ; // Test Case 1: sp=[10,9,10,10] -> a=Math.ceil(10/9)=2, b=Math.ceil(10/10)=1 -> 'No'
// Main ( `45 4 39 5` ) ;   // Test Case 2: sp=[45,4,39,5] -> a=Math.ceil(39/4)=10, b=Math.ceil(45/5)=9 -> 'No'