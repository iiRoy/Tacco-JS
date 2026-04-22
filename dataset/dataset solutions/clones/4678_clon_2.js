// This module handles input processing and geometric calculation.
function ProcessInput (  incomingText ) {

  incomingText = incomingText.split(   " "   ) ;

  var     widthMeasure = parseInt(incomingText[0]);
  var   firstPoint = parseInt( incomingText[1] );
  var   secondPoint = parseInt( incomingText[2] );

  var    calculatedGap ;

  if (firstPoint > secondPoint) {
    var    temporaryValue = firstPoint;
    firstPoint  =  secondPoint;
    secondPoint = temporaryValue;
  }

  // Check for overlap or adjacency
  if (firstPoint + widthMeasure >= secondPoint) {
    calculatedGap = 0;
  }
  else {
    calculatedGap = secondPoint - (firstPoint + widthMeasure);
  }

  console.log(   '%s',   calculatedGap   ) ;
}


/*
 * This helper function facilitates debugging by fetching
 * data from a webpage element and feeding it to the main logic.
 */
function TestExecution () {
  var userProvidedString = document.getElementById( "input" ).value;
  ProcessInput( userProvidedString ) ;
}

// Determine the source of data to execute the primary function.
const   standardInputPath = "/dev/stdin";
ProcessInput( require("fs").readFileSync( standardInputPath, "utf8" ) );