'use strict';
function ProcessText ( sourceContent ) {
  let contentLines = sourceContent.split ( "\n" );
  let targetSequence = contentLines[0];
  let budgetUnits = parseInt ( contentLines[1] );
  let currentPosition = 0 ;

  while ( budgetUnits ) {

    if ( targetSequence[ currentPosition ] == "a" ) {
      ++ currentPosition ;
    }

    else {
      let costToMakeA = ( 27 - ( targetSequence[ currentPosition ].charCodeAt( 0 ) - 97 + 1 ) );

      if ( costToMakeA <= budgetUnits ) {
        budgetUnits = budgetUnits - costToMakeA;
        targetSequence = targetSequence.slice( 0, currentPosition ) + "a" + targetSequence.slice( currentPosition + 1 );
        ++ currentPosition ;
      }

      else {

        if ( targetSequence.length === ( currentPosition + 1 ) ) {
          budgetUnits = budgetUnits % 26 ;
          var charCodeValue = ( targetSequence[ currentPosition ].charCodeAt( 0 ) + budgetUnits );
          if ( charCodeValue > 122 ) {
            charCodeValue += ( - 122 + 97 - 1 );
          }
          var finalCharacter = String.fromCharCode( charCodeValue );
          budgetUnits = 0 ;
          targetSequence = targetSequence.slice( 0, currentPosition ) + finalCharacter + targetSequence.slice( currentPosition + 1 );
        }

        else {
          ++ currentPosition ;
        }
      }
    }
  }
  console.log( targetSequence );
}
ProcessText( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );