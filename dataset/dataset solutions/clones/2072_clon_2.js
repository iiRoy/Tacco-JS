// This routine receives the complete textual data for processing.
function calculateGridCells(initialText) {
  initialText = initialText . split ( "\n" ) [ 0 ] ;

  const dimensionStrings = initialText . split ( ' ' ) . map ( ( currentSegment ) => {
    return parseInt ( currentSegment , 10 ) ;
  } ) ;

  const firstDimension = dimensionStrings [ 0 ] ;
  const secondDimension = dimensionStrings [ 1 ] ;

  let finalCount ;

  if ( ( firstDimension === 1 ) || ( secondDimension === 1 ) ) {
    finalCount = 1 ;
  }
  else {
    finalCount = ( ( firstDimension * secondDimension ) + 1 ) / 2 ;
  }

  console . log ( finalCount ) ;
}

/* Please refrain from altering the following section of code. It is responsible for reading data from standard input and executing the primary function. */
calculateGridCells ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;