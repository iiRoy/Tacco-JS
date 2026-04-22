function processInput(  sourceText  )
{
  var    parsedNumbers = sourceText
    .trim ( )
    .split ( "\n" )
      [ 0 ]
    .split ( " " )
      .map ( Number ) ;

  var   firstValue = parsedNumbers [ 0 ] ;
  var   secondValue = parsedNumbers [ 1 ] ;

  var   totalSum = 0 ;

  for ( var   loopCounter = 0 ;  loopCounter < 2 ;  loopCounter++  )
  {
    if  ( firstValue > secondValue )
    {
      totalSum  +=  firstValue ;
      firstValue-- ;
    }
    else
    {
      totalSum  +=  secondValue ;
      secondValue-- ;
    }
  }

  console.log ( totalSum ) ;
}

processInput ( require ( 'fs' ) .readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;