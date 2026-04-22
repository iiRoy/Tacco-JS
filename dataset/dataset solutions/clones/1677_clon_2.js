const rawContent = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )

; ( ( dataInput ) => {


 const textSegments = dataInput . split ( '\n' ) ;
 const elementCount = textSegments [ 0 ] - 0 ;
 const bitSequence = textSegments [ 1 ] . trim ( ) ;

 const bitCounter = ( aValue ) => {
  let activeBits = 0 ;
  do {
   ( aValue & 1 ) ? activeBits ++ : activeBits ;
  } while ( aValue = aValue >>> 1 ) ;
  return activeBits ;
 } ;

 const determineIterations = ( currentNumeric ) => {
  if ( currentNumeric === 0 ) {
   return 0 ;
  }
  let loopCount = 1 ;
  while ( currentNumeric %= bitCounter ( currentNumeric ) ) {
   loopCount ++ ;
  }
  return loopCount ;
 } ;

 let totalOnes = 0n ;
 for ( let k = 0 ; k < elementCount ; k ++ ) {
  if ( bitSequence [ k ] === '1' ) totalOnes ++ ;
 }
 const decrementCount = totalOnes - 1n ;
 const incrementCount = totalOnes + 1n ;
 const baseValue = BigInt ( parseInt ( bitSequence , 2 ) ) ;
 for ( let k = 0 ; k < elementCount ; k ++ ) {
  let alteredValue = baseValue ^ BigInt ( Math . pow ( 2 , elementCount - k - 1 ) ) ;
  if ( alteredValue === 0n ) {
   console . log ( 0 ) ;
  } else {
   const calculatedRemainder = Number ( alteredValue % ( bitSequence [ k ] === '1' ? decrementCount : incrementCount ) ) ;
   console . log ( determineIterations ( calculatedRemainder ) + 1 ) ;
  }
 }

} ) ( rawContent )