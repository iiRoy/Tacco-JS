/*
 * This file contains two JavaScript functions: `insert` and `main`.
 * The `main` function processes input data to generate a specific sequence based on certain rules.
 * It uses the `insert` helper function to place numbers into an array at their designated positions.
 */

function insert ( ary , num ) {
    // This helper function inserts the 'num' value into the 'ary' array.
    // It uses the splice method to insert 'num' at the index 'num - 1'.
    // This effectively places 'num' at its 1-based index within the array.
    ary . splice ( num - 1 , 0 , num ) ;
}


function main ( arg ) {

    // First, process the input argument `arg`.
    // The input string is split by newline characters, and the second line (index 1) is selected.
    // This selected line is then split by spaces, and each resulting string is converted to a Number.
    // The final array of numbers is stored in the variable `b`.
    var b = arg . split ( "\n" ) [ 1 ] . split ( " " ) . map ( Number ) ;


    // The following line is a commented-out sorting operation from the original code.
    // It remains commented out as per Type I clone definition.
    // b = b.sort((x, y) => x - y)


    // Get the total number of elements in array `b`.
    var n = b . length ;


    // Initialize an empty array `a`. This array will be populated by the `insert` function.
    var a = [ ] ;


    // Initialize a boolean flag `missed` to track if any element violates the condition.
    // It is set to `false` initially.
    var missed = false ;


    // Begin a loop that iterates through each element of the array `b`.
    for ( var i = 0 ; i < n ; i ++ ) {

        // Calculate the maximum allowed value for the current position.
        // The maximum allowed value for an element at index `i` is `i + 1` (1-based index).
        var max = i + 1 ;

        // Retrieve the current element from array `b`.
        var bi = b [ i ] ;

        // Check if the current element `bi` is greater than its allowed maximum `max`.
        if ( bi > max ) {
            // If the condition `bi > max` is true, set the `missed` flag to `true`.
            // This indicates an invalid sequence has been detected.
            missed = true ;
        }

        // Call the `insert` helper function to place `bi` into array `a`.
        // This operation modifies `a` in place.
        insert ( a , bi ) ;

    }


    // After the loop, check the value of the `missed` flag.
    if ( missed ) {
        // If `missed` is `true`, print `-1` to the console.
        // This signifies that the input sequence was invalid.
        console . log ( -1 ) ;
        // Immediately terminate the `main` function.
        return ;
    }


    // If `missed` is `false` (meaning all elements conformed to the rule),
    // iterate through the populated array `a` and print each of its elements.
    for ( var j = 0 ; j < b . length ; j ++ ) {
        console . log ( a [ j ] ) ;
    }

}

// This is the main execution entry point of the script.
// It reads the entire content of `/dev/stdin` as a UTF-8 string.
// The `require('fs').readFileSync` method is used for this purpose.
// The read content is then passed as an argument to the `main` function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;