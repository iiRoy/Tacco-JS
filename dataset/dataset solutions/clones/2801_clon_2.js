'use strict';
// This self-executing function processes some numerical input.
( function( rawDataStream )
  {
    // First, clean up the incoming data string.
    // Trim any leading/trailing whitespace, then split it by any sequence of spaces,
    // and finally convert each resulting string part into a numerical value.
    let parsedNumbersArray = rawDataStream
                              .trim()
                              .split( /\s+/ )
                              .map( val => val - 0 );

    // Extract the primary numerical components from the parsed array.
    let firstNumericalComponent  = parsedNumbersArray[ 0 ],
        secondNumericalComponent = parsedNumbersArray[ 1 ];

    // Calculate a specific portion to be subtracted based on conditional logic.
    // This involves checking if certain products or individual values are negative.
    let quantityToSubtract = ( secondNumericalComponent * ( secondNumericalComponent + firstNumericalComponent - 1 ) < 0 )
                             ? 0
                             : ( secondNumericalComponent < 0 )
                               ? ( secondNumericalComponent + firstNumericalComponent - 1 )
                               : secondNumericalComponent;

    // Perform the final computation and display the rounded result to the console.
    // The main formula calculates a sum based on an arithmetic progression,
    // then subtracts the previously determined quantity.
    console.log
    (
      Math.round
      (
        firstNumericalComponent * ( 2 * secondNumericalComponent + firstNumericalComponent - 1 ) / 2
        -
        quantityToSubtract
      )
    );

  }
)
// The function is immediately invoked with data read from standard input.
( require('fs').readFileSync('/dev/stdin','utf8') );