/*
 * This JavaScript code reads input, processes it line by line,
 * and determines an output based on specific numerical conditions.
 * It's designed to solve a particular problem involving number filtering
 * and summation checks against a threshold.
 */

var    input    =    require('fs')    .    readFileSync('/dev/stdin'    ,    'utf8')    ;


// The input string is trimmed and then split into an array of lines.
var    Arr    =    ( input . trim() ) . split ( "\n" ) ;


Arr . forEach ( function ( v ) { // Iterate over each individual line in the 'Arr' array.

       // Each line 'v' is split by space and then mapped to an array of numbers.
       var    arr    =    v . split ( " " ) . map ( Number ) ;

       // Initialize a reference array containing numbers from 1 to 10.
       var    m    =    [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]    ;

       // Filter the 'm' array: remove any numbers that are already present
       // in the first three elements of the 'arr' array.
       m    =    m . filter ( function ( v ) { return    ( v != arr[ 0 ]    &&    v != arr[ 1 ]    &&    v != arr[ 2 ] ) ; } ) ;

       // Initialize counters for 'yes' and 'no' outcomes.
       var    y    =    0    ;
       var    n    =    0    ;

       // For each remaining number 'v' in the filtered 'm' array,
       // check if the sum of arr[0], arr[1], and 'v' is less than or equal to 20.
       // Increment 'y' if true, 'n' if false.
       m . forEach ( function ( v ) { ( ( arr[ 0 ] + arr[ 1 ] + v ) <= 20 )    ?    y ++    :    n ++ ; } ) ;

       // Finally, print "YES" if the 'y' counter is greater than or equal to the 'n' counter,
       // otherwise print "NO".
       console . log ( y >= n    ?    "YES"    :    "NO" ) ;

} ) ; // End of the main forEach loop.