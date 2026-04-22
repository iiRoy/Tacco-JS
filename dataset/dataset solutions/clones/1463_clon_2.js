( function ( sourceString ) {
  var dataFragments = sourceString.split( '\n' ) ;
  var firstSetSize = Number( dataFragments.shift() ) ;
  var collectionOne = dataFragments.shift() . split( ' ' , firstSetSize ) . map( Number ) ;
  var secondSetSize = Number( dataFragments.shift() ) ;
  var collectionTwo = dataFragments.shift() . split( ' ' , secondSetSize ) . map( Number ) ;

  var occurrenceTotal = 0 ;
  collectionTwo . forEach( function ( currentVal ) {
    if ( collectionOne . indexOf( currentVal ) !== -1 )
    {
      occurrenceTotal ++ ;
    }
  } ) ;
  console . log( occurrenceTotal ) ;
} ) ( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;