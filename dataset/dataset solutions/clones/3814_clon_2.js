const ProcessInput = ( rawData ) => {
  // Parse the raw string input into an array of numbers.
  let numericValues = rawData
    .  split  (  "\n"  )
    .  map  (  val  =>  +  val  ) ;

  // The first number indicates the total count of subsequent items.
  let totalItems = numericValues [ 0 ] ;

  // Initialize an array to track the maximum length of consecutive sequences ending at each number.
  let sequenceLengths = Array ( totalItems + 1 ) . fill ( 0 ) ;

  // Iterate through the input numbers to compute sequence lengths.
  for
    (
      let idx = 1 ;
      idx <= totalItems ;
      idx ++
    )
  {
    // For each number, determine its consecutive sequence length.
    // This is based on the length of the sequence ending at the preceding number.
    sequenceLengths [ numericValues [ idx ] ] = sequenceLengths [ numericValues [ idx ] - 1 ] + 1 ;
  }

  // Variable to store the longest consecutive sequence found.
  let maxLength = 0 ;

  // Scan the computed sequence lengths to find the overall maximum length.
  for
    (
      let idx = 0 ;
      idx <= totalItems ;
      idx ++
    )
  {
    maxLength = Math . max ( maxLength , sequenceLengths [ idx ] ) ;
  }

  // Output the result: total items minus the maximum consecutive sequence length.
  console . log ( totalItems - maxLength ) ;
} ;

// Initiate the program by reading standard input and passing it to the processing function.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;