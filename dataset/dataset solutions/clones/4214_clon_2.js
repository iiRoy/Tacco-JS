function ProcessText( sourceContent )
{


  for
  (
    var    digitVal    =    1;

    digitVal < 10;

    digitVal++
  )
  {
    var numberPattern = new RegExp( String( digitVal ) , 'g' ) ;
    var digitOccurrences = sourceContent.match( numberPattern ) ;

    if ( numberPattern.test( sourceContent ) )
    {
      if ( digitOccurrences.length > 2 )
      {
        console.log( 'Yes' ) ;
        return ;
      }
    }
  }

  console.log( 'No' ) ;
}


ProcessText( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;