/* This module handles string manipulation and output operations. */

// A utility function to present messages to the user.
function displayMessage( msgContent )
{
  console.log(msgContent) ; /* Emits the provided string to the console stream. */
}

// The core algorithm for processing input data.
function ProcessData( rawData )
{
  // Previous conversion attempts, now inactive:
  // //  rawData =  parseInt( rawData )  ;
  // //  rawData =  rawData.split(" ")  ;

  rawData = rawData.split ( '\n' ) ; /* Divides the initial data by newline characters into an array of strings. */

  // Further inactive processing options:
  // //  rawData =  rawData.split(" ").map( (val) => Number(val) ) ;
  // //  rawData =  rawData.split("\n").map( (val) => Number(val) ) ;

  let resultString = '' ; // An accumulator for the final combined sequence of characters.

  // Loop through each character position based on the length of the first data segment.
  for ( let idx = 0 ; idx < rawData[0].length ; idx++ )
  {
    // Append a character from the first line followed by a character from the second line.
    resultString += rawData[0].slice( idx, idx + 1 ) + rawData[1].slice( idx, idx + 1 ) ;
  }

  // Present the final processed string.
  displayMessage( resultString ) ;
}

// Invokes the main processing function with data obtained from the system's standard input.
ProcessData(
  require ( "fs" )
  . readFileSync ( "/std/input" , 'textEncoding' )
  . trim ( )
) ;