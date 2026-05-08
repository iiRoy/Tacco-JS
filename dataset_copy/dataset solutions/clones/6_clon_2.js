( function  processData ( rawData ) {
  var   textRows  = rawData . trim( ) . split ( '\n' ) ;

  textRows . sort ( ( itemA , itemB ) => itemB - itemA )
           . slice ( 0 , 3 )
           . forEach ( element => console . log ( element ) ) ;
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;