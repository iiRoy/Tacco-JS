( function ( sourceContent )
{
  var parsedNumbersQueue = sourceContent . replace ( / \n $ / , '' ) . split ( '\n' ) . map ( Number ) ;
  var resultStack = [ ] ;
  while ( parsedNumbersQueue . length > 0 )
  {
    var currentNumber = parsedNumbersQueue . shift ( ) ;
    if ( currentNumber === 0 )
    {
      console . log ( resultStack . pop ( ) ) ;
      continue ;
    }
    resultStack . push ( currentNumber ) ;
  }
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;