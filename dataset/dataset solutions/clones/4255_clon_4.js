(function() {
    'use strict';

    let capturedInputs = [];
    const inputHandler = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    inputHandler.on('line', function(singleLine) {
      capturedInputs.push(singleLine);
    });

    process.stdin.on('end', function() {
      const initialValueStr = capturedInputs[0];
      const parsedValue = parseInt(initialValueStr, 10);

      const squareRootOfValue = Math.sqrt(parsedValue);
      const floorOfSquareRoot = Math.floor(squareRootOfValue);
      const finalResult = floorOfSquareRoot * floorOfSquareRoot;

      console.log(finalResult);
    });
})();