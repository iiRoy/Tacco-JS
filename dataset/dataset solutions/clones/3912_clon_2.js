'use strict';
function ProcessInput( rawData )
{
  const charArray = rawData.split( '' );
  console.log( charArray[0] != charArray[1] && charArray[0] != charArray[2] && charArray[1] != charArray[2]
               ? "True"
               : "False" );
}

ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );