/* This JavaScript code snippet demonstrates reading input, processing an array, generating combinations, and sorting results. */

// First, we obtain input from standard input using Node.js 'fs' module.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// The raw input string is then cleaned up and split into an array of strings.
// input.trim() removes any leading or trailing whitespace.
// .split("\n") divides the string into an array based on newline characters.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

/*
 * The problem statement often implies that the first line of input
 * provides some context, like the number of elements.
 * Here, Arr.shift() removes the first element from the array and returns it.
 * The '- 0' is a common idiom in JavaScript to explicitly convert a string to a number.
 */
var n = Arr . shift ( ) - 0 ;

// An empty array named 'ans' is initialized. This array will store
// the calculated results from the nested loops.
var ans = [ ] ;

// This section involves nested loops to generate specific combinations.
// The outer loop iterates with variable 'i' from 0 up to (but not including) 5.
for ( var i = 0 ; i < 5 ; i ++ )
{
    // The inner loop iterates with variable 'j'.
    // It starts from 'i + 1' to avoid duplicate pairs and self-combinations,
    // and also goes up to (but not including) 5.
    for ( var j = i + 1 ; j < 5 ; j ++ )
    {
        // Inside the inner loop, two new numbers are generated and pushed into 'ans'.
        // (Arr[i] + Arr[j]) concatenates two string elements from 'Arr'.
        // The '- 0' then converts this concatenated string into a number.
        ans . push ( ( Arr [ i ] + Arr [ j ] ) - 0 ) ;

        // The second push does the same, but with the elements in reverse order.
        // This ensures that both permutations (e.g., "12" and "21") are considered.
        ans . push ( ( Arr [ j ] + Arr [ i ] ) - 0 ) ;
    }
}


// After generating all combinations, the 'ans' array is sorted.
// The sort function uses a custom comparison (a - b) for numerical ascending order.
ans . sort ( function ( a , b ) { return a - b ; } ) ;


// Finally, the element at index 2 of the sorted 'ans' array is printed to the console.
// This implies the problem expects a specific element from the sorted list of generated numbers.
console . log ( ans [ 2 ] ) ;