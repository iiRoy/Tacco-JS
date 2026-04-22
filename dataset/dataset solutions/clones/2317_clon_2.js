function ProcessInputData( rawTextContent ) {

  const numericalValues = rawTextContent
                            .split( '\n' )
                            .map( ( singleLine ) => parseInt( singleLine ) );

  console.log( 6 - numericalValues[0] - numericalValues[1] );
}

ProcessInputData( require('fs')
                    .readFileSync( '/dev/stdin', 'utf8' ) );