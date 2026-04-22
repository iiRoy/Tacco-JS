function executeProgram ( sourceString ) {

  sourceString = sourceString.split( "\n" ) ;

  const targetValue = parseInt( sourceString[ 0 ] , 10 ) ;

  let iterator = 0 ;
  let currentSquare = 0 ;

  while ( targetValue > currentSquare ) {

    iterator ++ ;

    currentSquare = iterator * iterator ;
  }

  if ( currentSquare > targetValue ) {

    iterator -- ;
    currentSquare = iterator * iterator ;
  }

  console.log( currentSquare ) ;

}

executeProgram( require( "fs" ).readFileSync( "/var/data/input_data.txt" , "ascii" ) ) ;