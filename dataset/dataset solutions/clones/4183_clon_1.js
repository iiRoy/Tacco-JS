/*
 * This JavaScript code snippet is designed to process numerical input
 * from standard input to solve a problem related to reducing the number
 * of unique elements in a collection.
 *
 * It reads an initial set of parameters, then a list of numbers,
 * calculates frequencies, and determines a minimum count to remove.
 */

// Begin by reading all input from standard input.
// The 'fs' module is utilized for file system operations.
// '/dev/stdin' is the common path for standard input on Unix-like systems.
// The data is read as a UTF-8 string and then split into an array of lines.
inp = require( 'fs' ).readFileSync( '/dev/stdin' ,  'utf8'  ).split( '\n' ) ;


// The first line of input contains two space-separated values: N and K.
// 'shift()' removes and returns the first element (the first line) from the 'inp' array.
// 'split(' ')' then divides this line into an array of strings based on space characters.
l = inp.shift().split( ' ' ) ;


// Extract the first value from the 'l' array and assign it to variable N.
// N typically represents the total number of elements to process.
N = l[0] ;


// Extract the second value from the 'l' array and assign it to variable K.
// K usually signifies a target or threshold for unique elements.
K = l[1] ;


// Read the next line of input, which contains the actual data elements.
// These elements are also space-separated and form array A.
A = inp.shift().split( ' ' ) ;


// Initialize an empty object 'o' and an empty array 'a'.
// 'o' will be used as a set to track unique elements encountered.
// 'a' will effectively function as a frequency map, where indices are element values
// and values at those indices are their counts.
o = { } ;
a = [ ] ;


// Loop through each element in the array A, from index 0 up to N-1.
for  (  i = 0 ;  i < N ;  i++  )   {

  // Increment the frequency count for the current element A[i] in array 'a'.
  // The '|| 0' ensures that if 'a[A[i]]' is undefined (first encounter), it defaults to 0 before incrementing.
  a[A[i]] = ( a[A[i]]  ||  0 )  +  1 ;

  // Mark the current element A[i] as seen in object 'o'.
  // The value '1' is arbitrary; its purpose is merely to indicate presence.
  o[A[i]] = 1 ;

}


// Obtain an array of all unique keys (element values) that were stored in object 'o'.
keys = Object.keys( o ) ;


// Calculate 'c', which represents the number of unique element types that need to be removed.
// This is the difference between the total number of unique elements and the allowed number K.
c = keys.length  -  K ;


// Evaluate the condition: if 'c' is greater than 0, it means we have
// more unique element types than K, and thus some elements must be removed.
if  (  c > 0  )   {

  // Sort the 'a' array. In JavaScript, sorting a sparse array (like 'a' used here
  // as a frequency map where indices are string-based numbers) will sort the
  // *values* that are present at numerical indices.
  // The comparison function (b, c) => b - c sorts the counts in ascending order.
  a.sort( ( b , c )  =>  b - c ) ;

  // Initialize a counter 'cnt' to accumulate the total count of elements
  // that need to be removed to satisfy the unique element constraint.
  cnt = 0 ;

  // Iterate through the sorted counts stored in array 'a'.
  // 'k' will represent each frequency count.
  for  (  k  of  a  )   {

    // Add the current frequency 'k' to the total 'cnt'.
    cnt += k ;

    // Decrement 'c', which tracks how many more unique element types need to be 'eliminated'.
    c-- ;

    // If 'c' reaches 0, it means we have removed enough elements
    // such that the count of unique types is now K.
    // Therefore, we can break out of the loop.
    if  (  c === 0  )   {
      break ;
    }

  }

  // Output the final calculated total count 'cnt' to the console.
  console.log( cnt ) ;

}  else  {
  // If 'c' is not greater than 0 (i.e., c <= 0), it implies that
  // the number of unique elements is already K or less.
  // In this scenario, no elements need to be removed, so the result is 0.
  console.log( 0 ) ;
}

// End of program execution.