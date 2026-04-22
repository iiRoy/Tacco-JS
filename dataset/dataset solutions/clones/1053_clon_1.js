const line = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf-8' ) . split ( '\n' ) ; /* This line reads the entire standard input synchronously,
                                                                               decodes it as UTF-8, and then splits it into an array
                                                                               of strings based on newline characters.
                                                                               Each element in the 'line' array will correspond to a line
                                                                               from the input. */


let cnt = 0 ; // Initialize a counter variable. This will be used to count
              // the number of comparisons made during the merge sort process.


// The 'merge' function combines two sorted subarrays into a single sorted array.
// It's a core component of the merge sort algorithm.
const merge = ( arr , left , mid , right ) => {

  // Calculate the sizes of the two subarrays to be merged.
  const n1 = mid - left ;
  const n2 = right - mid ;

  // Create temporary arrays 'L' (left) and 'R' (right) to hold the subarrays.
  const L = [ ] ;
  const R = [ ] ;


  // Populate the 'L' (left) temporary array with elements from the first subarray.
  for ( let i = 0 ; i < n1 ; i++ ) {
    L[ i ] = arr[ left + i ] ;
  }

  // Populate the 'R' (right) temporary array with elements from the second subarray.
  for ( let i = 0 ; i < n2 ; i++ ) {
    R[ i ] = arr[ mid + i ] ;
  }


  // Add a sentinel value (Number.MAX_VALUE) to the end of both temporary arrays.
  // This simplifies the merge logic by avoiding explicit checks for array bounds.
  L[ n1 ] = Number . MAX_VALUE ;
  R[ n2 ] = Number . MAX_VALUE ;


  let i = 0 ; // Pointer for the 'L' array.
  let j = 0 ; // Pointer for the 'R' array.

  // Iterate through the original array segment from 'left' to 'right'.
  // In each step, pick the smaller element from the front of 'L' or 'R'
  // and place it into the correct position in the main array.
  for ( let k = left ; k < right ; k++ ) {
    cnt++ ; // Increment the comparison counter for each element placement.

    if ( L[ i ] <= R[ j ] ) {
      // If the element in 'L' is smaller or equal, take it.
      arr[ k ] = L[ i ] ;
      i++ ;
    } else {
      // Otherwise, take the element from 'R'.
      arr[ k ] = R[ j ] ;
      j++ ;
    }
  }

} ; // End of the 'merge' function definition.


// The 'msort' function implements the recursive merge sort algorithm.
// It divides the array into two halves, sorts them independently,
// and then merges the sorted halves.
const msort = ( arr , left , right ) => {

  // Base case for recursion: if the subarray has 0 or 1 element, it's already sorted.
  if ( left + 1 < right ) {
    // Calculate the middle point to divide the array.
    const mid = Math . floor ( ( left + right ) / 2 ) ;

    // Recursively sort the left half.
    msort ( arr , left , mid ) ;

    // Recursively sort the right half.
    msort ( arr , mid , right ) ;

    // Merge the two sorted halves.
    merge ( arr , left , mid , right ) ;
  }

} ; // End of the 'msort' function definition.


// Parse the input data:
// The actual numbers are on the second line (index 1) of the input.
// Split the string by spaces and convert each part to a number.
const data = line[ 1 ] . split ( ' ' ) . map ( Number ) ;

// Call the merge sort function to sort the 'data' array.
// The sort range is from index 0 up to (but not including) data.length.
msort ( data , 0 , data . length ) ;

// Print the sorted array elements, joined by spaces.
console . log ( data . join ( ' ' ) ) ;

// Print the total number of comparisons performed during the sort.
console . log ( cnt ) ;