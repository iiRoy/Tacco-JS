function ExecuteProcess( dataSource )
{
  var targetCount = parseInt( dataSource );
  var currentCandidate = 9;
  var matchCounter = 9;

  while ( matchCounter < targetCount )
  {
    currentCandidate++;

    var digitA = parseInt( String( currentCandidate ).substring( 0, 1 ) );
    var digitB = parseInt( String( currentCandidate ).substring( 1, 2 ) );

    if ( ( digitA - digitB ) < -1 )
    {
      currentCandidate = ( parseInt( String( currentCandidate ).substring( 0, 1 ) ) + 1 ) * ( 10 ^ ( String( currentCandidate ).length - 1 ) );
    }

    if ( ( digitA - digitB ) > 1 )
    {
      var temporaryValueA = parseInt( String( currentCandidate ).substring( 0, 1 ) ) * ( 10 ^ ( String( currentCandidate ).length - 1 ) );
      var temporaryValueB = parseInt( String( temporaryValueA ).substring( 0, 1 ) - 1 ) * ( 10 ^ ( String( currentCandidate - temporaryValueA ).length - 2 ) );
      var temporaryValueC = ( parseInt( String( currentCandidate - temporaryValueA ).substring( 0, 1 ) ) ) * ( 10 ^ ( String( currentCandidate - temporaryValueA ).length - 2 ) );
      currentCandidate = temporaryValueA + temporaryValueB + ( currentCandidate - temporaryValueA - temporaryValueC );
    }

    var isSequenceValid = true;
    for ( var indexPosition = 0; indexPosition < String( currentCandidate ).length - 1; indexPosition++ )
    {
      digitA = parseInt( String( currentCandidate ).substring( indexPosition, indexPosition + 1 ) );
      digitB = parseInt( String( currentCandidate ).substring( indexPosition + 1, indexPosition + 2 ) );

      if ( Math.abs( digitA - digitB ) > 1 )
      {
        isSequenceValid = false;
        break;
      }
    }

    if ( isSequenceValid === true )
    {
      matchCounter++;
    }
  }

  if ( targetCount >= 10 )
  {
    console.log( currentCandidate );
  }
  else
  {
    console.log( targetCount );
  }
}

ExecuteProcess( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );