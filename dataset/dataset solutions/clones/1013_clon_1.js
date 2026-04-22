process . stdin . resume ( ) ;
/*
 * Standard input stream is resumed.
 * This is necessary for Node.js to keep the process alive
 * and listen for incoming data from the console.
 */

process.stdin.setEncoding("utf8"); // Setting the encoding for input data.

// This constant initializes a readline interface to handle input and output.
const reader=require("readline").createInterface( {
  input : process.stdin ,
  output : process.stdout
} );


const lines = []; /* This array will store each line of input read from stdin. */

reader.on ( "line" , ( line ) => {
  // Each line read is pushed into the 'lines' array.
  lines.push(line);
} );


let cnt = 0; /* Global counter for swap operations in insertion sort. */


function insertionSort( A, g ) {
  // Performs an insertion sort on array A with a specific gap 'g'.
  // This is a subroutine used by Shell Sort.
  for ( let i = g ; i < A . length ; i++ )
  {
    let v = A [ i ] ; // 'v' stores the current element to be inserted.
    let j = i - g ; // 'j' is the index for comparison in the g-sublist.

    while ( j >= 0 && A [ j ] > v ) {
      // Shift elements in the g-sublist to the right if they are greater than 'v'.
      A [ j + g ] = A [ j ] ;
      j = j - g ;
      cnt ++ ; // Increment the global counter for each shift.
    }
    A [ j + g ] = v ; // Place 'v' in its correct sorted position within the g-sublist.
  }
}


function createG ( A ) {
  // Generates the sequence of gaps (G) for Shell Sort using Knuth's formula (3k + 1).
  const len = A . length ; // Get the length of the input array.
  let prev = 1 ; // Start with the smallest gap.
  const ret = [ 1 ] ; // Initialize the gap sequence array with 1.

  while ( true ) {
    prev = prev * 3 + 1 ; // Calculate the next gap in the sequence.

    if ( prev < len ) {
      ret . push ( prev ) ; // Add the gap to the sequence if it's smaller than array length.
    } else {
      break ; // Stop when the gap exceeds or equals the array length.
    }
  }
  return ret . reverse ( ) ; // Return the sequence in descending order, as required by Shell Sort.
}


function shellSort( A ) {
  // Implements the Shell Sort algorithm.
  cnt = 0 ; // Reset the global counter for each call to shellSort.

  const G = createG ( A ) ; // Generate the gap sequence.

  for ( let i = 0 ; i < G . length ; i++ ) {
    // Apply insertion sort for each gap in the sequence.
    insertionSort ( A , G [ i ] ) ;
  }
  return G ; // Return the gap sequence used.
}


reader.on ( "close" , ( ) => {
  // This block executes when the input stream is closed (e.g., end of file or Ctrl+D).

  const n = lines [ 0 ] - 0 ; // The first line contains the number of elements 'n'. Convert to number.
  const A = lines . slice ( 1 , n + 1 ) . map ( Number ) ; // Extract array elements and convert them to numbers.

  const G = shellSort ( A ) ; // Perform shell sort on array A and get the gap sequence.

  console . log ( G . length ) ; // Output the number of gaps used.
  console . log ( G . join ( " " ) ) ; // Output the gap sequence, space-separated.
  console . log ( cnt ) ; // Output the total count of element shifts during sorting.

  A . forEach ( ( e ) => console . log ( e ) ) ; // Output each sorted element of array A on a new line.
} ) ;