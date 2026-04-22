( function ( sourceData ) {
  var dataLines = sourceData . split ( '\n' ) ;
  var firstDataSetSize = Number ( dataLines . shift ( ) ) ;
  var primaryDataSet = dataLines . shift ( ) . split ( ' ' , firstDataSetSize ) . map ( Number ) ;
  var secondDataSetSize = Number ( dataLines . shift ( ) ) ;
  var secondaryDataSet = dataLines . shift ( ) . split ( ' ' , secondDataSetSize ) . map ( Number ) ;

  var foundMatches = 0 ;
  secondaryDataSet . forEach ( function ( currentElement ) {
    if ( currentElement in primaryDataSet ) {
      foundMatches ++ ;
    }
  } ) ;
  console . log ( foundMatches ) ;
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;