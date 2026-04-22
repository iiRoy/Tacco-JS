/* This function receives all content as its initial argument. */
function ProcessInputData (  sourceContent )
{
  /* The splitting operation generates an array where each element corresponds to a line. */


  parsedLines = sourceContent.split( '\n' ) ;

  var initialPortion = parsedLines.slice( 0, 4 ) ;
  var subsequentPart = parsedLines.slice( 4 ) ;

  /* Displaying the computed outcome. */
  console.log( initialPortion + ' ' + subsequentPart ) ;
}

/* Critical invocation, do not modify this line. */
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;