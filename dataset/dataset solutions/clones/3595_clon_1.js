/*
 * This is a utility function to calculate the median of a list.
 * It sorts the list in place and returns the middle element.
 * Assumes the list 'l' contains sortable elements and is not empty.
 */
const median = l => l . sort ( ) [ Math . floor ( l . length / 2 ) ]


// The main entry point function for processing the input.
function Main ( input ) {
  // Split the entire input string by newline characters.
  input = input . split ( "\n" ) ;

  // Parse the first line of input to get the integer N.
  N = parseInt ( input [ 0 ] ) ;

  // Split the second line of input by spaces to get array 'a'.
  a = input [ 1 ] . split ( " " ) ;

  // Initialize an empty array 'm' to store medians of sub-arrays.
  m = [ ] ;

  // Outer loop: iterates through all possible starting indices 'i'.
  for ( let i = 0 ; i < N ; i ++ ) {

    // Inner loop: iterates through all possible ending indices 'j' (exclusive).
    // 'j' starts from 'i + 1' to ensure sub-arrays have at least one element.
    for ( let j = i + 1 ; j < N + 1 ; j ++ ) {

      // Extract a sub-array from 'a' using slice(i, j).
      // Calculate its median and push it into array 'm'.
      m . push ( median ( a . slice ( i , j ) ) ) ;
    }
  }

  // After populating 'm' with all sub-array medians,
  // calculate the median of 'm' itself and print it to the console.
  console . log ( median ( m ) ) ;
}

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;