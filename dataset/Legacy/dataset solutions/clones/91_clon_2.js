( function ( rawData ) {
  var numericData = rawData . replace ( / \n $ / , '' ) . split ( '\n' ) . map ( Number ) ;

  var currentSum = - Infinity ;
  var maximumSum = - Infinity ;

  while ( true ) {
    var countElements = numericData . shift ( ) ;
    if ( countElements === 0 ) {
      break ;
    }
    currentSum = - Infinity ;
    maximumSum = - Infinity ;
    for ( var idx = 0 ; idx < countElements ; idx ++ ) {
      var currentValue = numericData . shift ( ) ;
      if ( currentValue > currentSum + currentValue ) {
        currentSum = currentValue ;
      } else {
        currentSum = currentSum + currentValue ;
      }
      if ( currentSum > maximumSum ) {
        maximumSum = currentSum ;
      }
    }
    console . log ( maximumSum ) ;
  }
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
