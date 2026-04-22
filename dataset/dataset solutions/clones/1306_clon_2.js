function processText ( sourceData ) {
  let workingString = sourceData ;
  let lowerChars = "abcdefghijklmnopqrstuvwxyz" ;
  let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" ;
  let resultString = "" ;
  for ( let charIndex = 0 ; charIndex < workingString . length ; charIndex ++ ) {
    let transformedChar = "" ;
    if ( lowerChars . indexOf ( workingString [ charIndex ] ) !== -1 ) {
      transformedChar = workingString [ charIndex ] . toUpperCase ( ) ;
    }
    else if ( upperChars . indexOf ( workingString [ charIndex ] ) !== -1 ) {
      transformedChar = workingString [ charIndex ] . toLowerCase ( ) ;
    }
    else {
      transformedChar = workingString [ charIndex ] ;
    }
    resultString += transformedChar ;
  }
  console . log ( resultString . trim ( ) ) ;
}
processText ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;