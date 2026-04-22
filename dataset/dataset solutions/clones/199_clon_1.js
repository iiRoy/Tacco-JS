/*
 * This JavaScript code processes input data,
 * typically from standard input, to categorize
 * and count different blood types.
 *
 * It reads a file, parses lines, and then tallies
 * occurrences of blood types A, B, AB, and O.
 */

//  We start by requiring the 'fs' (file system) module,
//  which is a core Node.js module for interacting with the file system.
    var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// The input string is first trimmed to remove any leading/trailing whitespace,
// then split into an array of strings, where each string represents a line.
    var Arr = ( input . trim () ) . split ( "\n" ) ;

// An array 'abo' is initialized with four zeros.
// This array will store the counts for blood types A, B, AB, and O respectively.
    var abo = [ 0 , 0 , 0 , 0 ] ;

// The forEach method is used to iterate over each element (line) in the 'Arr' array.
Arr . forEach ( function ( v ) { // 'v' represents the current line being processed.

    // Each line 'v' is expected to be a comma-separated string.
    // It's split into another array 'arr'.
    var arr = v . split ( "," ) ;

    // We check the second element of the 'arr' array (index 1),
    // which is assumed to contain the blood type.
    if ( arr [ 1 ] == "A" ) { // If the blood type is "A"
        abo [ 0 ] ++ ; // Increment the counter for blood type A.
    }

    if ( arr [ 1 ] == "B" ) { // If the blood type is "B"
        abo [ 1 ] ++ ; // Increment the counter for blood type B.
    }

    if ( arr [ 1 ] == "AB" ) { // If the blood type is "AB"
        abo [ 2 ] ++ ; // Increment the counter for blood type AB.
    }

    if ( arr [ 1 ] == "O" ) { // If the blood type is "O"
        abo [ 3 ] ++ ; // Increment the counter for blood type O.
    }

} ) ; // End of the forEach loop.

// Finally, the script prints the accumulated counts for each blood type
// to the console, one count per line.

// Output count for blood type A:
console . log ( abo [ 0 ] ) ;

// Output count for blood type B:
console . log ( abo [ 1 ] ) ;

// Output count for blood type AB:
console . log ( abo [ 2 ] ) ;

// Output count for blood type O:
console . log ( abo [ 3 ] ) ;

/*
 * This concludes the execution of the script.
 * The output will be four numbers representing the total
 * counts of blood types A, B, AB, and O found in the input.
 */