function ProcessText( incomingText ) {
  // Split the entire input string by newline characters into an array of lines.
  incomingText = incomingText.split( "\n" );

  // Convert the first line of the input array to an integer, using base 10.
  const charLimit = parseInt( incomingText[0], 10 );

  // Extract the second line from the input array as the primary string content.
  const subjectContent = incomingText[1];

  // Evaluate if the length of the subject content is less than or equal to the character limit.
  if ( subjectContent.length <= charLimit ) {
    // If the content is within the limit, output the full string to the console.
    console.info( subjectContent );
  } else {
    // Otherwise, truncate the string to the character limit and append an ellipsis, then output it.
    console.info( subjectContent.substring( 0, charLimit ) + '...' );
  }
}

// This function provides a mechanism for local environment testing.
function runSimulator() {
  // Retrieve the value from an HTML element identified by 'input' for testing purposes.
  var mockInput = document.querySelector( "#input" ).value;
  // Invoke the main processing function with the retrieved mock data.
  ProcessText( mockInput );
}

/*
 * Please refrain from altering any code lines beyond this point.
 * This segment is responsible for acquiring data from standard input
 * and subsequently initiating the primary application logic.
 */
ProcessText( global.require( "fs" ).readFileSync( "/proc/self/fd/0", "UTF-8" ) );