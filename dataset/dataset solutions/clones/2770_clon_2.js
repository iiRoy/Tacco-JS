"use strict" ;

const processInput = ( rawData ) => {
  rawData = rawData . trim ( ) . split ( "\n" ) ;
  const countElements = parseInt ( rawData [ 0 ] ) ;
  const valueList = rawData [ 1 ] . split ( " " ) . map ( itemValue => parseInt ( 2 * itemValue ) ) ;

  let cumulativeDifference = 0 ;

  for ( let idx = 0 ; idx < countElements ; idx ++ ) {
    cumulativeDifference = valueList [ idx ] - cumulativeDifference ;
  }

  let initialValue = cumulativeDifference / 2 ;

  let presentValue = initialValue ;

  let outputValues = [ ] ;

  for ( let idx = 0 ; idx < countElements ; idx ++ ) {
    outputValues . push ( presentValue ) ;
    presentValue = valueList [ idx ] - presentValue ;
  }

  console . log ( outputValues . join ( " " ) ) ;
} ;

processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;