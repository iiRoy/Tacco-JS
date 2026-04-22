function ProcessTextualData( incomingText ) {
  let characterSequence = incomingText.trim().split( "" ) ;

  if ( characterSequence.length === 3 ) {
    const initialCharacterStorage = characterSequence[ 0 ] ;

    characterSequence[ 0 ] = characterSequence[ 2 ] ;

    characterSequence[ 2 ] = initialCharacterStorage ;
  }

  console.log( characterSequence.join( "" ) ) ;
}

ProcessTextualData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;