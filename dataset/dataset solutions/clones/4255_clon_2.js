(function() {
  'use strict';

  const dataSegments = [];
  require('readline')
    .createInterface({
      input:  process.stdin,
      output: process.stdout
    })
    .on('line', function(inputSegment) {
      dataSegments.push(inputSegment);
    });
  process.stdin.on('end', function() {
    ;

    const upperBound = parseInt(dataSegments[0]);
    let finalAnswer = 0;

    for (let loopIndex = 0; loopIndex <= upperBound; loopIndex++) {
      let currentSquare = loopIndex * loopIndex;
      if (currentSquare <= upperBound) {
        finalAnswer = currentSquare;
      }
    }

    console.log(finalAnswer);

  });


})();