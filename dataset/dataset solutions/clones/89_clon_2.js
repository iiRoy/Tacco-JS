(function ( incomingData ) {
  var  allNumericData  =  incomingData . replace ( /\n$/, '' ) .split ( '\n' ) .map ( Number ) ;
  var  currentSubarraySum  =  -Infinity ;
  var  overallMaximumSum  =  -Infinity ;

  while ( true ) {
    var  dataChunkSize  =  allNumericData . shift () ;

    if ( dataChunkSize === 0 ) {
      break ;
    }

    currentSubarraySum  =  -Infinity ;
    overallMaximumSum  =  -Infinity ;

    for ( var  itemIndex  =  0 ;  itemIndex < dataChunkSize ;  itemIndex++ ) {
      var  currentNumber  =  allNumericData . shift () ;

      if ( currentNumber > currentSubarraySum + currentNumber ) {
        currentSubarraySum  =  currentNumber ;
      } else {
        currentSubarraySum  =  currentSubarraySum + currentNumber ;
      }

      if ( currentSubarraySum > overallMaximumSum ) {
        overallMaximumSum  =  currentSubarraySum ;
      }
    }
    console . log ( overallMaximumSum ) ;
  }
})( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;