const sourceText = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;
const dataLines = ( sourceText . trim ( ) ) . split ( "\n" ) ;
let numRounds = Number ( dataLines . shift ( ) ) ;
let firstPlayerPoints = 0 ;
let secondPlayerPoints = 0 ;
for ( let roundIdx = 0 ; roundIdx < numRounds ; roundIdx ++ )
{
  let currentLineText = dataLines . shift ( ) ;
  let numericPair = currentLineText . split ( " " ) . map ( val => Number ( val ) ) ;
  if ( numericPair [ 0 ] > numericPair [ 1 ] )
  {
    firstPlayerPoints += numericPair [ 0 ] + numericPair [ 1 ] ;
  }
  if ( numericPair [ 0 ] < numericPair [ 1 ] )
  {
    secondPlayerPoints += numericPair [ 0 ] + numericPair [ 1 ] ;
  }
  if ( numericPair [ 0 ] == numericPair [ 1 ] )
  {
    firstPlayerPoints += numericPair [ 0 ] ;
    secondPlayerPoints += numericPair [ 1 ] ;
  }
}
console . log ( firstPlayerPoints + " " + secondPlayerPoints ) ;