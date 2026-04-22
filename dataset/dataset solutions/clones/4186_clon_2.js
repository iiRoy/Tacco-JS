function  PerformOperation ( incomingText ) {
  // Parse the input string into a list of numerical figures
  const   quantityList = incomingText . split ( ' ' ) . map (   valTxt   =>   Number ( valTxt )   ) ;

  // Calculate the product of the first two numbers
  const   multipliedValue = quantityList [ 0 ] * quantityList [ 1 ] ;
  // Retrieve the third number for comparison
  const   targetNumber = quantityList [ 2 ] ;

  // Determine and output the smaller of the two calculated values
  if   ( multipliedValue   >   targetNumber )   {
    console . log ( targetNumber ) ;
  }   else   {
    console . log ( multipliedValue ) ;
  }
}

// Read data from standard input and pass it to the main processing function
PerformOperation ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;