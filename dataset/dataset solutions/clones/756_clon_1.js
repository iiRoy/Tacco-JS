/*
 * This JavaScript program processes a sequence of numbers based on a series of operations.
 * It reads its input from standard input, manipulates an array, and then outputs a specific element.
 */

// First, we import the 'fs' (file system) module, which is necessary for reading files.
// Then, we synchronously read the entire content of '/dev/stdin' as a UTF-8 encoded string.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Next, we take the raw input string, remove any leading or trailing whitespace,
// and then split it into an array of strings, using the newline character as a delimiter.
// Each element in 'arr' will now correspond to a line from the input.
var arr = input . trim ( ) . split ( "\n" ) ;


// The first line of the input array (which is now 'arr') contains the value for 'n'.
// We remove this element from the beginning of 'arr' using 'shift()'.
// The '-0' trick is used to explicitly convert the string to a number.
var n = arr . shift ( ) - 0 ; // 'n' represents the count of initial elements to generate.


// The second line of input provides two values: 'a' and 'd'.
// These values define an arithmetic progression.
// We remove this line, split it by space, and then map each part to a Number.
// Array destructuring is used to assign these two numbers to 'a' and 'd' respectively.
var [ a , d ] = arr . shift ( ) . split ( " " ) . map ( Number ) ;


// We initialize an empty array named 'retu'. This array will store our sequence of numbers.
var retu = [ ] ;


// This loop populates the 'retu' array with 'n' elements.
// The elements form an arithmetic progression starting with 'a' and having a common difference 'd'.
// The formula for the i-th term (0-indexed) is a + i * d.
for ( var i = 0 ; i < n ; i ++ ) { // Loop 'n' times to generate initial sequence.
    retu . push ( a + i * d ) ; // Add the calculated term to the 'retu' array.
}


// The next line from the input array contains the value for 'm'.
// 'm' specifies the total number of operations that will be performed on the 'retu' array.
// Again, we use 'shift()' and '-0' to get the numeric value of 'm'.
var m = arr . shift ( ) - 0 ; // 'm' signifies the count of operations to execute.


// This loop iterates 'm' times, processing one operation in each iteration.
for ( var i = 0 ; i < m ; i ++ ) {

    // Each operation line consists of three numbers: 'x', 'y', and 'z'.
    // We parse them similarly to 'a' and 'd'.
    var [ x , y , z ] = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // We check the value of 'x' to determine the type of operation.
    // If 'x' is 0, it means we need to swap two elements in the 'retu' array.
    // The elements at indices (y-1) and (z-1) are swapped.
    if ( x == 0 ) {
        // Perform an efficient swap using array destructuring assignment.
        [ retu [ y - 1 ] , retu [ z - 1 ] ] = [ retu [ z - 1 ] , retu [ y - 1 ] ] ;
    }
    // If 'x' is not 0 (implicitly 1 in typical problem contexts, but any non-zero value here),
    // it means we need to assign the value of one element to another.
    // The element at index (y-1) is updated with the value of the element at index (z-1).
    else {
        retu [ y - 1 ] = retu [ z - 1 ] ; // Assign value from index (z-1) to (y-1).
    }
}


// Finally, the last line of input contains the value for 'k'.
// 'k' represents the 1-based index of the element we need to output from the 'retu' array.
var k = arr . shift ( ) - 0 ; // 'k' is the index of the element to be printed.


// We print the element located at index (k-1) (because arrays are 0-indexed)
// from the 'retu' array to the console.
console . log ( retu [ k - 1 ] ) ;

// The program concludes here after printing the final result.