(function() {
    'use strict';

    var inputBuffer = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentLine) {
      inputBuffer.push(currentLine);
    });
    process.stdin.on('end', function() {

      var targetValue = parseInt(inputBuffer[0], 10);
      
      var squareRootEstimate = Math.sqrt(targetValue);
      var integerRoot = Math.floor(squareRootEstimate);
      var resultSquare = integerRoot * integerRoot;

      console.log(resultSquare);

    });

})();
