var memoGrid = [ ] ;
for ( var rowIter = 0 ; rowIter <= 10 ; rowIter ++ ) {
  memoGrid [ rowIter ] = [ ] ;
  for ( var colIter = 0 ; colIter <= 330 ; colIter ++ ) {
    memoGrid [ rowIter ] [ colIter ] = 0 ;
  }
}

var digitAvailability = [ ] ;
for ( var digitIndex = 0 ; digitIndex <= 9 ; digitIndex ++ )
  digitAvailability [ digitIndex ] = false ;

function generateSequences ( currentSum , currentLevel ) {
  memoGrid [ currentLevel ] [ currentSum ] ++ ;
  currentLevel ++ ;
  if ( currentLevel === 11 )
    return ;
  for ( var chosenDigit = 0 ; chosenDigit <= 9 ; chosenDigit ++ ) {
    if ( digitAvailability [ chosenDigit ] )
      continue ;
    digitAvailability [ chosenDigit ] = true ;
    generateSequences ( currentSum + chosenDigit * currentLevel , currentLevel ) ;
    digitAvailability [ chosenDigit ] = false ;
  }
}

generateSequences ( 0 , 0 ) ;

var rawInputData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var inputQueryLines = rawInputData . trim ( ) . split ( "\n" ) ;
inputQueryLines . forEach ( function ( currentLine ) {
  var parsedQueryValues = currentLine . split ( " " ) . map ( Number ) ;
  var queryCount = parsedQueryValues [ 0 ] ;
  var querySum = parsedQueryValues [ 1 ] ;
  var finalResult = ( memoGrid [ queryCount ] [ querySum ] === undefined ) ? 0 : memoGrid [ queryCount ] [ querySum ] ;
  console . log ( finalResult ) ;
} ) ;