function processInputData( rawDataString ) {

  const [ [ numItems ,  allowedDistance ] , ...coordinateSet ] =
    rawDataString
      .split( '\n' )
      .map(  singleLineContent  =>  singleLineContent.split( ' ' ).map( Number )  )
  ;

  let eligiblePointsCount = 0
  ;

  coordinateSet.forEach( currentPointValue => {
    const [ xComponent , yComponent ] = currentPointValue ;
    Math.sqrt( xComponent * xComponent + yComponent * yComponent ) <= allowedDistance && eligiblePointsCount++ ;
  } ) ;

  console.log( eligiblePointsCount ) ;

}

processInputData( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ) ;