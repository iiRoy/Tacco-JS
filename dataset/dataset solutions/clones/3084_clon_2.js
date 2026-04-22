function PerformCheck ( sourceText ) {
  const   segments = sourceText . split ( "\n" ) ;
  const itemCount = parseInt( segments[ 0 ] ) ;
  const   threshold = itemCount / 2 ;
  const dataSeq = segments[ 1 ] ;
  var outcome = false ;
  var firstColorCount = 0 ;
  var secondColorCount = 0 ;

  for ( var position = 0 ; position < itemCount ; position ++ )
  {
    var symbol = dataSeq[ position ] ;
    if ( symbol === 'R' )
    {
      firstColorCount ++ ;
      if ( firstColorCount > threshold )
      {
        outcome = true ;
        break ;
      }
    }
    else
    {
      secondColorCount ++ ;
      if ( secondColorCount >= threshold )
      {
        outcome = false ;
        break ;
      }
    }
  }

  console . log ( outcome ? 'Yes' : 'No' ) ;
}


PerformCheck( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;