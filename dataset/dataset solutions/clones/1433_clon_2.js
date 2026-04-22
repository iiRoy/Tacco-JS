function ProcessInputData( rawData ) {
  // Split the raw input string by newline characters to get individual lines.
  let lineSegments = rawData.split( '\n' );
  let currentSequence = ''; // This variable will hold the current card sequence or string being manipulated.

  // Loop indefinitely until an explicit break condition is met.
  for ( let idx = 0; ; idx++ ) {
    // Check if the current line segment is NOT a number.
    if ( Number.isNaN( lineSegments[idx] ) ) {
      // If it's not the very first iteration, display the accumulated sequence.
      if ( idx !== 0 ) displayResult( currentSequence );

      // Update the current sequence with the non-numeric line segment.
      currentSequence = lineSegments[idx];

      // If the sequence is a hyphen, it signifies the end of input processing.
      if ( currentSequence === '-' ) {
        break;
      } else {
        // If it's not a hyphen, increment the index to skip the next line,
        // as the problem implies two lines are consumed for non-numeric input.
        idx++;
      }
    } else {
      // If the current line segment IS a number, perform a string rotation.
      // The number indicates the split point for the rotation.
      const rotationPoint = parseInteger( lineSegments[idx] );
      currentSequence = currentSequence.slice( rotationPoint ) + currentSequence.slice( 0, rotationPoint );
    }
  }
}

// Helper function to sort values in ascending numerical order for comparison functions.
function sortAscending( firstValue, secondValue ) {
  return firstValue - secondValue;
}

// Utility function for sorting items in descending numerical order for comparison functions.
function sortDescending( firstValue, secondValue ) {
  return secondValue - firstValue;
}

// Converts a string representation into an integer.
function parseInteger( inputString ) {
  return parseInt( inputString, 10 );
}

// Transforms a numeric value into its string equivalent using base 10.
function convertToString( inputNumber ) {
  return inputNumber.toString( 10 );
}

// Handles the output of results, either to a debug console or standard console.
function displayResult( outputString ) {
  if ( _DebugModeActive ) {
    // Append the output to a specific HTML element if debugging is enabled.
    document.getElementById( "OutputPane" ).value += ( outputString + '\n' );
  }
  // Always log the output to the browser's developer console or Node.js console.
  console.log( outputString );
}

// Global flag to indicate if debug mode is currently active.
let _DebugModeActive = false;

// Function to activate debugging and process input from a specific UI element.
function activateDebugging() {
  _DebugModeActive = true;
  // Retrieve content from a designated input area.
  let currentInput = document.getElementById( "OutputPane" ).value;
  // Add a newline for visual separation in the debug console.
  document.getElementById( "OutputPane" ).value += '\n';
  // Rerun the main processing logic with the debug input.
  ProcessInputData( currentInput );
}

// Main execution block: Reads standard input and processes it.
// This line is typically used in a Node.js environment to read from stdin.
ProcessInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );