'use strict';

(function ( standardInputData ) {
  // Define the primary function for processing input

  // Initialize necessary data storage
  var processedTokens = standardInputData . toString()
                                          .trim()
                                          .split(' ');
  var primaryNumber = parseInt( processedTokens[0] );
  var middleNumber = parseInt( processedTokens[1] );
  var finalNumber = parseInt( processedTokens[2] );

  // Core conditional logic starts here
  if (primaryNumber < middleNumber) {
    if ( middleNumber < finalNumber ) {
      console.log('Yes');
      return; // Exit point for "Yes"
    }
  }

  console.log('No'); // Default output if conditions are not met

  // Output section
  // console.log(processedTokens); // For debugging purposes, shows parsed input
})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );