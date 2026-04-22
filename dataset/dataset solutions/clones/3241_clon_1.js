function Main ( input ) {
  // Split the input string by newline characters to get an array of lines.
  input = input.split ( "\n" ) ;

  N = parseInt ( input [ 0 ] ) ; // Parse the first line as the number N.

  C1 = new Array ( N ) ; // Initialize C1 array with size N.
  C2 = new Array ( N ) ; // Initialize C2 array with size N.

  for ( var i = 0 ; i < N ; i ++ ) { // Loop N times to process subsequent input lines.
    tmp = input [ i + 1 ] . split ( " " ) ; // Split each line by space.
    C1 [ i ] = [ parseInt ( tmp [ 0 ] ) , parseInt ( tmp [ 1 ] ) , i ] ; // Store parsed integers and original index.
    C2 [ i ] = [ parseInt ( tmp [ 0 ] ) , parseInt ( tmp [ 1 ] ) , i ] ; // Duplicate data for C2.
  }

  var flag = 0 ; // Initialize flag, controlling which array to process.
  var a = 0 ; // Accumulator for 'a' values.
  var b = 0 ; // Accumulator for 'b' values.

  C1 . sort ( funcCompare1 ) ; // Sort C1 using funcCompare1.
  C2 . sort ( funcCompare2 ) ; // Sort C2 using funcCompare2.

  C3 = new Array ( ) ; // Initialize an empty array C3 to keep track of processed indices.

  for ( var i = 0 ; i < N ; i ++ ) { // Main loop to process N elements.

    if ( flag == 0 ) { // If flag is 0, process C1.

      if ( C3 . indexOf ( C1 [ 0 ] [ 2 ] ) != -1 ) { // Check if the current element's index is already in C3.
        while ( C3 . indexOf ( C1 [ 0 ] [ 2 ] ) != -1 ) { // If found, remove elements from C1 until a new one is found.
          C1 . shift ( ) ; // Remove the first element.
        }
      }
      a += C1 [ 0 ] [ 0 ] ; // Add the first component to 'a'.
      flag = 1 ; // Toggle flag to 1 for the next iteration.
      C3 . push ( C1 [ 0 ] [ 2 ] ) ; // Add the index to C3.
      C1 . shift ( ) ; // Remove the processed element from C1.

    } else { // If flag is 1, process C2.

      if ( C3 . indexOf ( C2 [ 0 ] [ 2 ] ) != -1 ) { // Check if the current element's index is already in C3.
        while ( C3 . indexOf ( C2 [ 0 ] [ 2 ] ) != -1 ) { // If found, remove elements from C2 until a new one is found.
          C2 . shift ( ) ; // Remove the first element.
        }
      }
      b += C2 [ 0 ] [ 1 ] ; // Add the second component to 'b'.
      flag = 0 ; // Toggle flag to 0 for the next iteration.
      C3 . push ( C2 [ 0 ] [ 2 ] ) ; // Add the index to C3.
      C2 . shift ( ) ; // Remove the processed element from C2.
    }
  }
  var ans = a - b ; // Calculate the final answer.

  console.log ( '%s' , ans ) ; // Output the result.
}

// This function is for debugging purposes, typically used in a browser environment.
function debug ( ) {
  var input = document . getElementById ( "input" ) . value ;
  Main ( input ) ;
}
// This line executes the Main function with input from stdin in a Node.js environment.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

function funcCompare1 ( a , b ) { // Custom comparison function for sorting C1.
  if ( a [ 0 ] < b [ 0 ] ) return 1 ; // Sorts in descending order based on first element.
  if ( a [ 0 ] > b [ 0 ] ) return -1 ;
  if ( a [ 1 ] < b [ 1 ] ) return 1 ; // Then by second element, also descending.
  if ( a [ 1 ] > b [ 1 ] ) return -1 ;
  return 0 ; // Elements are equal.
}

function funcCompare2 ( a , b ) { // Custom comparison function for sorting C2.
  if ( a [ 1 ] < b [ 1 ] ) return 1 ; // Sorts in descending order based on second element.
  if ( a [ 1 ] > b [ 1 ] ) return -1 ;
  if ( a [ 0 ] < b [ 0 ] ) return 1 ; // Then by first element, also descending.
  if ( a [ 0 ] > b [ 0 ] ) return -1 ;
  return 0 ; // Elements are equal.
}