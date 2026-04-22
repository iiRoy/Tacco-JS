function Main ( input ) {
  // This is the main function that processes the input data.
  // It reads a string, parses numbers, sorts them, and then performs a specific calculation.


  let [ l, ...valArr ] = input . split ( '\n' ) ; // Split input string by newlines. The first line is 'l', the rest go into 'valArr'.


  // Process the array: parse each element as a float and then sort them numerically.
  valArr = valArr . map ( e => parseFloat ( e ) ) . sort ( function ( a , b ) {
    return a - b ;
  } ) ;


  let result = [ ] ; // Initialize an empty array to store results.
  let counter = 0 ; // Initialize a counter for tracking the current position in 'valArr'.


  // Iterate through each element in the sorted 'valArr'.
  for ( let ele of valArr ) {
    // Create a sub-array 'opArr' containing elements AFTER the current 'ele'.
    // The pre-increment operator '++counter' ensures the slice starts from the next element.
    let opArr = valArr . slice ( ++ counter , valArr . length ) ;


    // Filter 'opArr' to find elements 'e' where 'e * ele' is an integer (i.e., (e*ele) % 1 === 0).
    let temp = opArr . filter ( e => ( e * ele ) % 1 === 0 ) ;


    // If 'temp' contains any elements, append them to the 'result' array using the spread operator.
    if ( temp . length ) {
      result = [ ... result , ... temp ] ;
    }
  }

  // Finally, print the total count of elements found in the 'result' array.
  console . log ( result . length ) ;
}

// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;