"use strict";

var processInputData = function processInputData( rawTextContent ) {
  var inputLines = rawTextContent.split('\n') ;
  var totalElements = parseInt(inputLines[0], 10);
  var integerSequence = [ ] ;

  for (  var idx = 1; idx <= totalElements; idx++  ) {
    integerSequence.push( parseInt(inputLines[idx], 10) ) ;
  }

  var currentValue = integerSequence[0];
  var targetReached = false;
  var operationSteps = 0;

  for ( var loopCounter = 0; loopCounter < totalElements; loopCounter++ ) {
    operationSteps++;

    if ( currentValue == 2 ) {
      targetReached = true;
      break;
    }

    currentValue = integerSequence[currentValue - 1];
  }

  if (targetReached) {
    console.log(operationSteps);
  } else {
    console.log(-1);
  }
};

processInputData( require('fs').readFileSync('/dev/stdin', 'utf-8') );