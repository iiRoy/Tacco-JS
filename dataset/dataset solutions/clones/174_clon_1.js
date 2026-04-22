/*
 * This JavaScript file defines a puzzle-solving mechanism.
 * The core logic involves generating a set of unique sorted number combinations
 * and then checking input strings against these combinations.
 */
function Puzzle ( ) {

    // Initialize an empty object to store unique valid combinations as keys.
    var obj = { } ;

    // Define two arrays of number strings.
    // arrA contains three-digit numbers.
    var arrA = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999" . split ( "," ) ;

    // arrB contains two-digit numbers.
    var arrB = "11,22,33,44,55,66,77,88,99" . split ( "," ) ;


    /*
     * This section generates all possible combinations by iterating through
     * elements of arrA four times and arrB once.
     * It's a deeply nested loop structure.
     */
    for ( var i = 0 ; i < 16 ; i++ )
        for ( var j = 0 ; j < 16 ; j++ )
            for ( var k = 0 ; k < 16 ; k++ )
                for ( var l = 0 ; l < 16 ; l++ )
                    for ( var m = 0 ; m < 9 ; m++ ) {

                        // Concatenate selected elements to form a raw string.
                        var str = arrA [ i ] + arrA [ j ] + arrA [ k ] + arrA [ l ] + arrB [ m ] ;

                        // Process the string:
                        // 1. Split into individual characters.
                        // 2. Convert each character to a number.
                        // 3. Sort the numbers in ascending order.
                        // 4. Join them back into a sorted string.
                        str = str . split ( "" ) . map ( Number ) . sort ( function ( a , b ) { return a - b ; } ) . join ( "" ) ;

                        // Store the sorted string as a key in the 'obj' object.
                        // The value 'true' indicates its presence.
                        obj [ str ] = true ;
                    }

    // Return the object containing all valid sorted combinations.
    return obj ;

}


// Execute the Puzzle function to pre-calculate all valid combinations.
// The result is stored in 'P'.
var P = Puzzle ( ) ;


// Read input from standard input, assuming it's UTF-8 encoded.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Main processing loop: continue until all input lines are processed.
while ( true ) {

    // If there are no more lines to process, break out of the loop.
    if ( Arr . length == 0 )
        break ;

    // Get the next line from the input array.
    var str = Arr . shift ( ) ;

    // Initialize an array to store the valid answers for the current input line.
    var ans = [ ] ;


    // Iterate through possible single-digit numbers (1 to 9).
    for ( var i = 1 ; i <= 9 ; i++ ) {

        // Create a copy of the input string's digits as numbers.
        var arr = str . split ( "" ) . map ( Number ) ;

        // Add the current single-digit number 'i' to the array.
        arr . push ( i ) ;

        // Sort the combined array of numbers.
        arr . sort ( function ( a , b ) { return a - b ; } ) ;


        // Count occurrences of each digit (0-9) in the sorted array.
        var cnt = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;
        arr . forEach ( function ( v ) { cnt [ v ] ++ ; } ) ;

        // Find the maximum count of any single digit.
        var max = Math . max . apply ( null , cnt ) ;

        // If any digit appears 5 or more times, this combination is invalid.
        // Skip to the next iteration.
        if ( max >= 5 )
            continue ;

        // Check if the sorted combination (joined back into a string) exists
        // as a valid combination in the pre-calculated 'P' object.
        if ( P . hasOwnProperty ( arr . join ( "" ) ) )
            // If it's a valid combination, add 'i' to the answers.
            ans . push ( i ) ;

    }

    // Output the results:
    // If no answers were found, print "0".
    // Otherwise, print the found answers separated by spaces.
    console . log ( ( ans . length == 0 ) ? "0" : ans . join ( " " ) ) ;
}