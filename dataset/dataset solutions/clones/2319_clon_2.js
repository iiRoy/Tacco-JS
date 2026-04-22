function processInputData ( sourceData ) {
  // Start by cleaning up the incoming raw data stream.
  let dataRows = sourceData . trim ( ) . split ( "\n" ) ;

  // Extract the first numerical value from the processed lines.
  const valOne = parseInt ( dataRows [ 0 ] , 10 ) ;

  // Extract the second numerical value from the processed lines.
  const valTwo = parseInt ( dataRows [ 1 ] , 10 ) ;

  // Define a predefined collection of integers for filtering.
  const candidateNumbers = [ 1 , 2 , 3 ] ;

  // Apply a filter to the collection, removing elements that match either of the extracted values.
  const filteredElements = candidateNumbers . filter (
    ( currentNum ) => currentNum !== valOne && currentNum != valTwo
  ) ;

  // Display the first matching element found after filtering.
  console . log ( filteredElements [ 0 ] ) ;
}


// Initiate the primary execution flow by reading content from the standard input.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;