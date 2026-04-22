inputLines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( / \s / ) ;
numericRange = [ 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 ] ;

for ( mainLoopIdx = 0 ; mainLoopIdx < inputLines . length - 1 ; mainLoopIdx += 3 ) {
  positiveMatches = 0 ;
  for ( subLoopIdx = 0 ; subLoopIdx < 10 ; subLoopIdx ++ ) {
    if ( numericRange [ subLoopIdx ] <= 20 - ( inputLines [ mainLoopIdx ] * 1 + inputLines [ mainLoopIdx + 1 ] * 1 ) && numericRange [ subLoopIdx ] != inputLines [ mainLoopIdx + 2 ] && numericRange [ subLoopIdx ] != inputLines [ mainLoopIdx + 1 ] && numericRange [ subLoopIdx ] != inputLines [ mainLoopIdx ] ) {
      positiveMatches ++ ;
    }
  }
  if ( positiveMatches >= 4 ) {
    console . log ( "Yes" ) ;
  } else {
    console . log ( "No" ) ;
  }
}