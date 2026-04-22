/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original.
 *
 * Changes are limited exclusively to:
 * - Whitespace (indentation, spacing, blank lines)
 * - Comments (addition, modification, or removal)
 *
 * The purpose is to demonstrate a visually different representation
 * while maintaining exact logical and structural equivalence.
 */

function Main (  input  ) {
    // Declare and initialize the 'temp' variable by processing the input string.
    // First, trim any leading/trailing whitespace, then split by newline characters.
    var temp  =  input . trim ( ) . split ( "\n" ) ;

    // Parse the first part of the first line of input to get K.
    // It's expected to be a space-separated value, taking the first element.
    var K  =  parseInt ( temp [ 0 ] . split ( " " ) [ 0 ] ,  10 ) ;

    // Parse the second part of the first line of input to get N.
    // Similar to K, it's the second element after splitting by space.
    var N  =  parseInt ( temp [ 0 ] . split ( " " ) [ 1 ] ,  10 ) ;

    // Process the second line of input to get array A.
    // Split by spaces, then use map to convert each string element to a number.
    var A  =  temp [ 1 ] . split ( " " ) . map ( x  =>  x * 1 ) ;

    // Initialize 'maxd' to 0. This variable will store the maximum distance.
    var maxd  =  0 ;

    // 'd' variable is declared but not used in the original logic.
    var d  =  [ ] ;

    // Loop through the 'A' array from index 0 up to (but not including) N.
    for  ( var  i  =  0  ;  i  <  N  ;  i ++ ) {
        // Check if it's the last element in the array (circular distance).
        if  (  i + 1  ==  N  )  {
            // Calculate the distance from the last element back to the first element (circular).
            // Update maxd if this distance is greater.
            maxd  =  Math . max ( maxd , ( ( K - A [ i ] )  +  A [ 0 ] ) ) ;
        }
        else  {
            // For non-last elements, calculate the distance to the next element.
            // Update maxd if this distance is greater.
            maxd  =  Math . max ( maxd ,  A [ i + 1 ]  -  A [ i ] ) ;
        }
    }

    // Finally, print the result: K minus the maximum distance found.
    console . log ( K  -  maxd ) ;
}

// Invoke the Main function with input read from /dev/stdin.
// This is typical for competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;