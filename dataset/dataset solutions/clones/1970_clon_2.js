const processInput = ( rawData ) => {
  // This function orchestrates the primary computation based on the provided input string.

  const numericValues = rawData.split ( ' ' ) . map ( itemString => Number ( itemString ) ) ;

  // Derive an upper boundary value from the first parsed numerical component.
  const upperBound = numericValues [ 0 ] + 1 ;

  // Obtain a specific subtraction coefficient from the second numerical component.
  const subtractionFactor = numericValues [ 1 ] ;

  // Calculate the maximum iteration threshold for the subsequent accumulation loop.
  const loopLimit = upperBound - subtractionFactor + 1 ;

  // Initialize a running total variable to zero before commencing accumulation.
  let totalAccumulator = 0 ;

  // Begin a loop that iterates from an initial index up to the calculated limit.
  for ( let counterIndex = 0 ; counterIndex < loopLimit ; counterIndex ++ ) {
    totalAccumulator += loopLimit - counterIndex ; // Add a decreasing sequence to the total.
  }

  // Display the final computed sum, ensuring it is modulo a large prime constant.
  console.log ( totalAccumulator % ( 10 ** 9 + 7 ) ) ;
} ;

// Initiate the processing by reading data from standard input asynchronously.
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;