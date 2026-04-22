// This is a JavaScript file demonstrating basic input processing and array manipulation.
// The "use strict" directive enables strict mode for the entire script.
"use strict" ;

// Strict mode helps catch common coding errors and "unsafe" actions,
// and ensures cleaner, more robust code.


// Define the main function that processes the input.
const Main = ( input ) => {

    // First, split the entire input string by newline characters.
    // .trim() removes any leading/trailing whitespace, ensuring a clean split.
    let xs = input . trim ( ) . split ( '\n' ) ;

    // 'xs' will now be an array where each element is a line from the input.


    // Extract the value for N from the first line of input.
    // xs[0] is the first line. .split(' ') separates numbers by space.
    // [0] gets the first number, and Number() converts it from string to integer.
    let N = Number ( xs [ 0 ] . split ( ' ' ) [ 0 ] ) ;

    // N represents the total count of elements in the subsequent list.


    // Extract the value for K from the first line of input.
    // Similar process as N, but [1] gets the second number.
    let K = Number ( xs [ 0 ] . split ( ' ' ) [ 1 ] ) ;

    // K represents the number of smallest elements we need to sum.


    // Initialize an empty array named 'l'.
    let l = [ ] ;

    // This array will store the numerical values from the second line of input.


    // Loop N times to populate the array 'l'.
    // The loop iterates from i=0 up to (but not including) N.
    for ( let i = 0 ; i < N ; i ++ ) {

        // For each iteration, take an element from the second line of input (xs[1]).
        // xs[1].split(' ') creates an array of strings from the second line.
        // [i] accesses the i-th element of that array.
        l . push ( xs [ 1 ] . split ( ' ' ) [ i ] ) ;

    }

    // At this point, array 'l' contains N string elements from the input.


    // Define a custom comparison function for sorting.
    // This function will be passed to the Array.prototype.sort() method.
    const compare = ( b , a ) => { // The original comment was "関数名は何でもOK" (Function name is anything OK)

        // This expression (a - b) results in an ascending sort order.
        // If 'a' is smaller than 'b', 'a - b' is negative, so 'a' comes before 'b'.
        // If 'a' is larger than 'b', 'a - b' is positive, so 'a' comes after 'b'.
        // If 'a' and 'b' are equal, 'a - b' is zero, maintaining relative order.
        return a - b ; // Original comment: "a - b 昇順 b - a 降順" (a - b ascending, b - a descending)

    } ;

    // The custom comparison function 'compare' is now defined.


    // Sort the array 'l' using the custom 'compare' function.
    // After this line, 'l' will contain its elements sorted in ascending order.
    l . sort ( compare ) ;

    // Array 'l' is now sorted numerically from smallest to largest.


    // Initialize a variable 'ans' to store the sum of the smallest K elements.
    let ans = 0 ;

    // This variable will accumulate the final result.


    // Loop K times to sum the first K elements of the sorted array 'l'.
    // Since 'l' is sorted ascending, these are the smallest K elements.
    for ( let i = 0 ; i < K ; i ++ ) {

        // Convert the current element l[i] to a Number (it's currently a string)
        // and add it to the 'ans' accumulator.
        ans += Number ( l [ i ] ) ;

    }

    // The variable 'ans' now holds the sum of the K smallest numbers.


    // Output the final calculated answer to the console.
    console . log ( ans ) ;

    // This marks the end of the Main function's execution.

} ; // End of the Main function definition.


// The script execution starts here.
// It reads the entire content of standard input synchronously.
// 'fs.readFileSync' reads the file '/dev/stdin' (standard input)
// and 'utf8' specifies the encoding.
// The resulting string is then passed as the 'input' argument to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// This line ensures the script runs using the provided input mechanism.
// Script execution flow completes after Main function returns.