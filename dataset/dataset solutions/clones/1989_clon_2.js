function ProcessData( incomingText ) {
 const textLines = incomingText . split ( "\n" ) ;
 const targetString = textLines[1] ;
 let loopCounter = 1 ;
 let numberSet = [ ] ;
 while ( loopCounter <= textLines[0] ) {
  numberSet . push ( loopCounter ) ;
  loopCounter ++ ;
 }
 let totalCombinations = 0 ;
 const checkDistinct = ( valX , valY , valZ ) => {
  return valX !== valY && valY !== valZ && valZ !== valX ;
 } ;
 numberSet . forEach ( firstElement => {
  numberSet . forEach ( secondElement => {
   numberSet . forEach ( thirdElement => {
    if (
     checkDistinct (
      targetString [ firstElement - 1 ] ,
      targetString [ secondElement - 1 ] ,
      targetString [ thirdElement - 1 ]
     ) &&
     firstElement < secondElement &&
     secondElement < thirdElement &&
     ( secondElement - firstElement !== thirdElement - secondElement )
    ) {
     console . log ( firstElement , secondElement , thirdElement ) ;
     totalCombinations ++ ;
    }
   } ) ;
  } ) ;
 } ) ;
 console . log ( totalCombinations ) ;
}
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;