process. stdin . setEncoding ( 'utf-8' ) ;

process. stdin. on( 'data' , function ( receivedText ) {

  inputParts = receivedText . replace( /\r?\n/g , "" ) . split(" ") ;

  if ( parseInt( inputParts[0] ) === -1
    && parseInt( inputParts[1] ) === -1
    && parseInt( inputParts[2] ) === -1 )
  {
    process.exit();
  }
  ;

  totalScore = ( parseInt( inputParts[0] ) === -1 ? 0 : parseInt( inputParts[0] ) )
             + ( parseInt( inputParts[1] ) === -1 ? 0 : parseInt( inputParts[1] ) ) ;

  if ( totalScore >= 80 )
  {
    console . log( "A" ) ;
  }
  else if ( totalScore >= 65 )
  {
    console . log( "B" ) ;
  }
  else if ( totalScore >= 50 )
  {
    console . log( "C" ) ;
  }
  else if ( totalScore >= 30 )
  {
    if ( parseInt( inputParts[2] ) >= 50 )
    {
      console.log( "C" ) ;
    }
    else
    {
      console.log( "D" ) ;
    }
  }
  else
  {
    console.log( "F" ) ;
  }

} ) ;