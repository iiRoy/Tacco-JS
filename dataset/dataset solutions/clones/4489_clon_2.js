// This module defines a primary handler for processing textual data.
function ProcessInput( inputStringData ) {

  // The incoming string is segmented by spaces, and each segment
  // is subsequently converted into an integer value for numerical operations.
  const numericCollection = inputStringData . split ( ' ' ) . map (
    ( elementString ) => parseInt ( elementString , 10 )
  ) ;

  // Retrieve the initial three numerical components from the collection.
  const componentOne = numericCollection [ 0 ] ;
  const componentTwo = numericCollection [ 1 ] ;
  const componentThree = numericCollection [ 2 ] ;

  // Compute the total sum of the first three components,
  // then subtract the maximum value found within the entire numeric collection.
  // The final calculated outcome is then displayed to the console.
  console . log (
    componentOne + componentTwo + componentThree - Math . max ( ...numericCollection )
  ) ;

}

// Obtain the complete content from the standard input stream,
// ensuring it is interpreted as UTF-8 encoded text.
// Subsequently, invoke the main processing routine with this acquired text content.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;