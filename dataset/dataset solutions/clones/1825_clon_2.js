function ProcessInputData( incomingText )
{
  // This function processes text input to calculate a time difference.
  incomingText = incomingText.split( "\n" ) ;

  var dataSegments = incomingText[0].split( ' ' ) ;
  var initialHour = parseInt( dataSegments[0] ) ;
  var initialMinute = parseInt( dataSegments[1] ) ;
  var finalHour = parseInt( dataSegments[2] ) ;
  var finalMinute = parseInt( dataSegments[3] ) ;
  var subtractedOffset = parseInt( dataSegments[4] ) ;

  var totalStartMinutes = 60 * initialHour + initialMinute ;
  var totalEndMinutes = 60 * finalHour + finalMinute ;
  var calculatedResult = totalEndMinutes - totalStartMinutes - subtractedOffset ;
  console.log( calculatedResult ) ;
}

// This section handles file system interaction for execution and should typically remain unchanged.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;