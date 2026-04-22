/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original.
 * Only whitespace (spaces, tabs, newlines) and comments have been modified
 * or added to create visual difference.
 */


// Function to read input from standard input.
function myin ( ) {
    return require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
        . trim ( ) ;
}


// Function to print output to standard output.
function myout ( t ) {
    console . log ( t ) ;
}

// --- Input Conversion Helper Function Definitions ---
// The following comments describe the conversion modes for `myconv`.
// Conversion Modes:
// 0: No operation; returns the input as is.
// 1: Converts input to an integer.
// 2: Splits input by half-width space into a string array.
// 3: Splits input by newline into a string array.
// 4: Splits input by half-width space and converts elements to numbers.
// 5: Splits input by newline and converts elements to numbers.
// 6: Splits input into an array of single characters (strings).
// 7: Splits input into an array of single characters and converts them to numbers.


function myconv ( i , no ) {
    switch ( no ) {
        case 0 : // Case 0: Return input unchanged
            return i ;
        case 1 : // Case 1: Convert to integer
            return parseInt ( i ) ;
        case 2 : // Case 2: Split by space
            return i . split ( " " ) ;
        case 3 : // Case 3: Split by newline
            return i . split ( "\n" ) ;
        case 4 : // Case 4: Split by space, then map to Number
            return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
        case 5 : // Case 5: Split by newline, then map to Number
            return i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;
        case 6 : // Case 6: Split into individual characters
            return i . split ( "" ) ;
        case 7 : // Case 7: Split into individual characters, then map to Number
            return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
    }
}


// The main logic of the program.
function Main ( input ) {

    // Convert the input string to an integer.
    input = myconv ( input , 1 ) ;

    // Calculate the 'original cost' based on the input and a fixed tax rate (1.08).
    var genka = input / 1.08 ;

    // Calculate two temporary values based on 'genka' and the tax rate.
    // tmp1 uses Math.floor after applying tax.
    var tmp1 = Math . floor ( genka * 1.08 ) ;

    // tmp2 uses Math.ceil after applying tax.
    var tmp2 = Math . ceil ( genka * 1.08 ) ;

    // Check if the original input matches tmp1.
    if ( input == tmp1 ) {
        // If it matches, output the ceiling of 'genka'.
        myout ( Math . ceil ( genka ) ) ;
    }
    // Otherwise, check if the original input matches tmp2.
    else if ( input == tmp2 ) {
        // If it matches, output the floor of 'genka'.
        myout ( Math . floor ( genka ) ) ;
    }
    // If neither condition is met.
    else {
        // Output a sad face.
        myout ( ":(" ) ;
    }

} // End of Main function.


// Call the Main function with input read from 'myin()'.
Main ( myin ( ) ) ;