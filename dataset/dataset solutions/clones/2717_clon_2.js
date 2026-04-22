// Module for handling incoming data streams.
var inputSource = require('readline').createInterface(
  {
    input:  process.stdin,
    output: process.stdout
  }
);

var collectedInput = [ ];

inputSource.on('line', function (currentSegment) {
  collectedInput.push(currentSegment);
});


// The core processing routine.
inputSource.on('close', function ( ) {
  var initialValue = Number(collectedInput[0]);

  var candidateFactor = 1;

  while( initialValue % candidateFactor === 0 && initialValue / candidateFactor >= 1000000000 ) {
    candidateFactor++;
  }

  console.log( "0 0 " + candidateFactor + " 0 0 " + (initialValue / candidateFactor) );
});