/*
 * This JavaScript code reads input from standard input,
 * processes it line by line, and performs a specific calculation
 * to determine whether to output "YES" or "NO".
 *
 * It's structured to solve a common type of programming problem
 * where input needs to be parsed and logic applied iteratively.
 */

// First, we import the 'fs' (File System) module, which is essential
// for reading data from standard input in Node.js environments.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Next, we take the raw input string, remove any leading or trailing whitespace
// using `trim()`, and then split it into an array of strings based on newline characters.
// Each element in the 'Arr' array will represent one line of the input.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// We then iterate over each element (which is a line from the input)
// in the 'Arr' array. The `forEach` method applies a function to each item.
Arr . forEach ( function ( v ) {

    // Inside the loop, for each line 'v':
    // 1. We split the line by spaces (" ") to get an array of string numbers.
    // 2. We use `map(Number)` to convert each string number into an actual numeric type.
    // This 'arr' variable now holds the initial numbers provided on the current line.
    var arr = v . split ( " " ) . map ( Number ) ;


    // We initialize an array 'm' containing integers from 1 to 10.
    // This array will be filtered based on the values in 'arr'.
    var m = [ 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 ] ;


    // The 'm' array is then filtered. The `filter` method creates a new array
    // with all elements for which the provided function returns `true`.
    // The condition `(v != arr[0] || v != arr[1] || v != arr[2])` means:
    // an element 'v' from 'm' is kept if it is NOT equal to arr[0]
    // OR it is NOT equal to arr[1] OR it is NOT equal to arr[2].
    // In simpler terms, 'v' is removed ONLY if it is equal to arr[0] AND arr[1] AND arr[2].
    m = m . filter ( function ( v ) {
        return ( v != arr [ 0 ] || v != arr [ 1 ] || v != arr [ 2 ] ) ;
    } ) ;


    // Two counters are initialized: 'y' for "yes" conditions and 'n' for "no" conditions.
    var y = 0 ;
    var n = 0 ;


    // We iterate through the filtered 'm' array. For each number 'v' in 'm':
    m . forEach ( function ( v ) {
        // We check if the sum of arr[0], arr[1], and the current 'v' is less than or equal to 20.
        // This is a ternary operation: if the condition is true, 'y' is incremented;
        // otherwise (if false), 'n' is incremented.
        ( ( arr [ 0 ] + arr [ 1 ] + v ) <= 20 ) ? y ++ : n ++ ;
    } ) ; // End of the inner forEach loop for 'm'.


    // Finally, after checking all numbers in the filtered 'm' array,
    // we compare the counts 'y' and 'n'.
    // If 'y' is greater than 'n', "YES" is printed to the console;
    // otherwise, "NO" is printed.
    console . log ( y > n ? "YES" : "NO" ) ;

} ) ; // End of the outer forEach loop for 'Arr'.