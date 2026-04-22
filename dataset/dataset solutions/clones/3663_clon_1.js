function main ( input ) {

  // Initialize 'array' by splitting the input string by newline characters.
  var array = input . split ( '\n' ) ;
  // Remove the first element from the 'array', often used for a count or header.
  array . shift ( ) ;

  // Declare 'bridgeList' as an empty array, which will store arrays of numbers.
  var bridgeList = [ ] ;
  // Initialize 'cut' counter, starting with 1.
  var cut = 1 ;


  // First primary loop: iterates through the 'array' to populate 'bridgeList'.
  for ( var i = 0 ; i < array . length ; i ++ ) {

    // For each element in 'array', initialize a new empty array within 'bridgeList'.
    bridgeList [ i ] = [ ] ;

    // Inner loop: populates the current 'bridgeList[i]' with parsed integers.
    // The range for 'j' is determined by characters at specific indices of 'array[i]'.
    for ( var j = array [ i ] [ 0 ] ; j < array [ i ] [ 2 ] ; j ++ ) {
      // Convert 'j' to an integer and add it to the current sub-array in 'bridgeList'.
      bridgeList [ i ] . push ( parseInt ( j ) ) ;
    } // End of inner loop.

  } // End of first primary loop.


  // Second primary loop: processes and potentially merges elements within 'bridgeList'.
  // Iterates up to the second to last element to allow comparison with 'i+1'.
  for ( var i = 0 ; i < bridgeList . length - 1 ; i ++ ) {

    // Output the current state of 'bridgeList' to the console (possibly for debugging).
    console . log ( bridgeList ) ;

    // Conditional check: determines if the current 'bridgeList[i]' and the next 'bridgeList[i+1]'
    // have any common elements using the 'sameArray' helper function.
    if ( sameArray ( bridgeList [ i ] , bridgeList [ i + 1 ] ) . length != 0 ) {
      // If common elements are found, update 'bridgeList[i]' with the intersection.
      bridgeList [ i ] = sameArray ( bridgeList [ i ] , bridgeList [ i + 1 ] ) ;
      // Remove the next element ('bridgeList[i+1]') from the array as it has been merged.
      bridgeList . splice ( i + 1 , 1 ) ;
      // Decrement 'i' to re-evaluate the newly modified 'bridgeList[i]' with its new successor.
      i -- ;
    }
    else {
      // If no common elements are found, increment the 'cut' counter.
      cut ++ ;
    }

  } // End of second primary loop.


  // Output the final count of 'cut' after all processing, ensuring it's an integer.
  console . log ( parseInt ( cut ) ) ;

} // End of 'main' function.


// Helper function: 'sameArray' finds and returns common elements between two input arrays.
function sameArray ( arr1 , arr2 ) {

  // Initialize an empty array to store the common elements.
  var newArr = [ ] ;

  // Loop through each element in the first array, 'arr1'.
  for ( var i = 0 ; i < arr1 . length ; i ++ ) {
    // Check if the current element of 'arr1' exists in 'arr2'.
    // 'indexOf' returns -1 if the element is not found, or its index if found.
    if ( arr2 . indexOf ( arr1 [ i ] ) >= 0 ) {
      // If the element is found in 'arr2', add it to 'newArr'.
      newArr . push ( arr1 [ i ] ) ;
    }
  } // End of loop through 'arr1'.

  // Return the array containing all common elements.
  return newArr ;

} // End of 'sameArray' function.


// Invoke the 'main' function immediately.
// It reads input from standard input ('/dev/stdin') using Node.js 'fs' module,
// and decodes it as UTF-8.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;